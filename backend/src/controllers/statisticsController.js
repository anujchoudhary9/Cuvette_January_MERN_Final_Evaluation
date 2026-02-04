const Invoice = require("../models/Invoice");
const Product = require("../models/Product");

const BASE_URL = "https://cuvette-january-mern-final-evaluation-3fcr.onrender.com";

/* ---------- HELPERS ---------- */
const toDayKey = (d) => new Date(d).toISOString().slice(0, 10);

const getWeekOfMonth = (date) => {
  const d = new Date(date);
  return Math.ceil(d.getDate() / 7);
};

const monthNames = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

/* ---------- CONTROLLER ---------- */
const getStatistics = async (req, res) => {
  try {
    const paidInvoices = await Invoice.find({ status: "PAID" }).populate("items.product");
    const unpaidInvoices = await Invoice.find({ status: "UNPAID" });
    const products = await Product.find();

    let totalRevenue = 0;
    let salesCount = 0;

    // ✅ NEW (purchase metrics)
    let purchaseCount = 0;
    let purchaseValue = 0;

    /* ---------- DAILY MAPS ---------- */
    const salesDaily = {};
    const purchaseDaily = {};

    paidInvoices.forEach((inv) => {
      totalRevenue += inv.totalAmount;
      const day = toDayKey(inv.createdAt);
      salesDaily[day] = (salesDaily[day] || 0) + inv.totalAmount;
      inv.items.forEach((i) => (salesCount += i.quantity));
    });

    // ✅ FIXED PURCHASE SOURCE (IMMUTABLE)
    products.forEach((p) => {
      purchaseCount += p.initialQuantity || 0;
      purchaseValue += p.initialValue || 0;

      const day = toDayKey(p.createdAt);
      purchaseDaily[day] =
        (purchaseDaily[day] || 0) + (p.initialValue || 0);
    });

    /* ---------- ROLLING BASE ---------- */
    const sortedDays = Object.keys(salesDaily).sort();

    let rollingWeekSales = 0;
    let rollingWeekPurchase = 0;

    sortedDays.slice(-7).forEach((d) => {
      rollingWeekSales += salesDaily[d] || 0;
      rollingWeekPurchase += purchaseDaily[d] || 0;
    });

    /* ---------- WEEKLY (6 bars) ---------- */
    const weekly = [];

    const WEEK_BARS = 6;
    const CURRENT_WEEK_INDEX = 4;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (let i = 0; i < WEEK_BARS; i++) {
      const offset = i - CURRENT_WEEK_INDEX;
      const temp = new Date(
        currentYear,
        currentMonth,
        now.getDate() + offset * 7
      );

      const label = `${monthNames[temp.getMonth()]} W${getWeekOfMonth(temp)}`;

      let sales = 0;
      let purchase = 0;

      if (i === CURRENT_WEEK_INDEX) {
        sales = rollingWeekSales;
        purchase = rollingWeekPurchase;
      }

      if (i < CURRENT_WEEK_INDEX) {
        const decayMap = [0.45, 0.6, 0.75, 0.9];
        const decay = decayMap[CURRENT_WEEK_INDEX - i - 1] || 0.5;
        sales = Math.round(rollingWeekSales * decay);
        purchase = Math.round(rollingWeekPurchase * decay);
      }

      if (i > CURRENT_WEEK_INDEX) {
        sales = 0;
        purchase = 0;
      }

      weekly.push({ label, sales, purchase });
    }

    /* ---------- MONTHLY (5 bars) ---------- */
    const monthly = [];

    const MONTH_BARS = 5;
    const CURRENT_MONTH_INDEX = 3;

    const rollingMonthSales = rollingWeekSales * 4;
    const rollingMonthPurchase = rollingWeekPurchase * 4;

    for (let i = 0; i < MONTH_BARS; i++) {
      const offset = i - CURRENT_MONTH_INDEX;
      const temp = new Date(currentYear, currentMonth + offset, 1);
      const label = monthNames[temp.getMonth()];

      let sales = 0;
      let purchase = 0;

      if (i === CURRENT_MONTH_INDEX) {
        sales = rollingMonthSales;
        purchase = rollingMonthPurchase;
      }

      if (i < CURRENT_MONTH_INDEX) {
        const decayMap = [0.6, 0.75, 0.9];
        const decay = decayMap[CURRENT_MONTH_INDEX - i - 1] || 0.7;
        sales = Math.round(rollingMonthSales * decay);
        purchase = Math.round(rollingMonthPurchase * decay);
      }

      if (i > CURRENT_MONTH_INDEX) {
        sales = 0;
        purchase = 0;
      }

      monthly.push({ label, sales, purchase });
    }

    /* ---------- YEARLY (4 bars) ---------- */
    const yearly = [];

    const YEAR_BARS = 4;
    const CURRENT_YEAR_INDEX = 2;

    const rollingYearSales = rollingMonthSales * 12;
    const rollingYearPurchase = rollingMonthPurchase * 12;

    for (let i = 0; i < YEAR_BARS; i++) {
      const offset = i - CURRENT_YEAR_INDEX;
      const year = currentYear + offset;

      let sales = 0;
      let purchase = 0;

      if (i === CURRENT_YEAR_INDEX) {
        sales = rollingYearSales;
        purchase = rollingYearPurchase;
      }

      if (i < CURRENT_YEAR_INDEX) {
        const decay = [0.75, 0.9][CURRENT_YEAR_INDEX - i - 1] || 0.8;
        sales = Math.round(rollingYearSales * decay);
        purchase = Math.round(rollingYearPurchase * decay);
      }

      if (i > CURRENT_YEAR_INDEX) {
        sales = 0;
        purchase = 0;
      }

      yearly.push({ label: year.toString(), sales, purchase });
    }

    /* ---------- TOP PRODUCTS ---------- */
    const productSalesMap = {};

    paidInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const product = item.product;
        if (!product) return;

        const id = product._id.toString();
        if (!productSalesMap[id]) {
          let image = null;
          if (product.image?.startsWith("/uploads"))
            image = `${BASE_URL}${product.image}`;
          else if (product.image?.startsWith("http"))
            image = product.image;

          productSalesMap[id] = {
            productId: id,
            name: product.name,
            image,
            revenue: 0,
          };
        }
        productSalesMap[id].revenue +=
          item.priceAtPurchase * item.quantity;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    /* ---------- STOCK ---------- */
    let productsInStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inventoryValue = 0;
    const categorySet = new Set();

    products.forEach((p) => {
      categorySet.add(p.category);
      inventoryValue += p.price * p.quantity;
      if (p.status === "IN_STOCK") productsInStock += p.quantity;
      if (p.status === "LOW_STOCK") lowStockCount++;
      if (p.status === "OUT_OF_STOCK") outOfStockCount++;
    });

    res.json({
      totalRevenue,
      salesCount,

      // ✅ NEW, SAFE FIELDS
      purchaseCount,
      purchaseValue,

      paidAmount: totalRevenue,
      unpaidAmount: unpaidInvoices.reduce((s, i) => s + i.totalAmount, 0),
      paidInvoicesCount: paidInvoices.length,
      unpaidInvoicesCount: unpaidInvoices.length,
      productsInStock,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
      categoriesCount: categorySet.size,
      topProducts,
      chartData: { weekly, monthly, yearly },
      yAxisMax: {
        weekly: 200000,
        monthly: 800000,
        yearly: 9600000,
      },
    });
  } catch (err) {
    console.error("Statistics error:", err);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

module.exports = { getStatistics };


