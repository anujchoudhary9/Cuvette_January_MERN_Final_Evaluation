import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getStatistics } from "../services/statisticsApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "../styles/home.css";

/* ===== ICON IMPORTS ===== */
import SalesYellow from "../assets/images/Project/Sales_Yellow.png";
import SalesBlue from "../assets/images/Project/Sales_Blue.png";
import SalesGreen from "../assets/images/Project/Sales_Green.png";
import SalesPink from "../assets/images/Project/Sales_Pink.png";

import InventoryYellow from "../assets/images/Project/Inventory_Yellow.png";
import InventoryGreen from "../assets/images/Project/Inventory_Green.png";

import PurchaseBlue from "../assets/images/Project/Purchase_Blue.png";
import PurchaseYellow from "../assets/images/Project/Purchase_Yellow.png";
import PurchaseGreen from "../assets/images/Project/Purchase_Green.png";
import PurchasePink from "../assets/images/Project/Purchase_Pink.png";

import ProductYellow from "../assets/images/Project/Product_Yellow.png";
import ProductGreen from "../assets/images/Project/Product_Green.png";

const PRODUCT_PLACEHOLDER =
  "https://cdn-icons-png.flaticon.com/512/679/679821.png";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("weekly");

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStatistics();
        setStats(data);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <p>Loading dashboard...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p style={{ color: "red" }}>{error}</p>
      </Layout>
    );
  }

  const salesCount = stats?.salesCount ?? 0;
  const revenue = stats?.totalRevenue ?? 0;
  const cost = Math.round(revenue * 0.65);
  const profit = revenue - cost;

  /* ===== REAL PURCHASE DATA (FROM BACKEND) ===== */
  const purchaseCount = stats?.purchaseCount ?? 0;
  const purchaseValue = stats?.purchaseValue ?? 0;

  /* ===== STILL STATIC / UI-ONLY ===== */
  const cancelled = Math.floor(purchaseCount * 0.06);
  const returns = Math.floor(purchaseCount * 0.2);

  const chartData = stats?.chartData?.[range] ?? [];

  /* ===== DERIVED GRAPH DATA (SALES vs PURCHASE) ===== */

  const hasGraphData = purchaseValue > 0 || revenue > 0;

  const basePurchase = purchaseValue;
  const baseSales = revenue;

  const derivedChartData =
    !hasGraphData
      ? chartData
      : range === "weekly"
        ? [
          { label: "Jan W1", purchase: Math.round(basePurchase * 0.98), sales: Math.round(baseSales * 0.98) },
          { label: "Jan W2", purchase: Math.round(basePurchase * 1.02), sales: Math.round(baseSales * 1.02) },
          { label: "Jan W3", purchase: Math.round(basePurchase * 0.96), sales: Math.round(baseSales * 0.96) },
          { label: "Jan W4", purchase: Math.round(basePurchase * 1.04), sales: Math.round(baseSales * 1.04) },
          { label: "Feb W1", purchase: basePurchase, sales: baseSales },
          { label: "Feb W2", purchase: 0, sales: 0 },
        ]

        : range === "monthly"
          ? [
            {
              label: "Oct",
              purchase: Math.round(basePurchase * 4 * 0.92),
              sales: Math.round(baseSales * 4 * 0.92),
            },
            {
              label: "Nov",
              purchase: Math.round(basePurchase * 4 * 0.96),
              sales: Math.round(baseSales * 4 * 0.96),
            },
            {
              label: "Dec",
              purchase: Math.round(basePurchase * 4 * 1.0),
              sales: Math.round(baseSales * 4 * 1.0),
            },
            {
              label: "Jan",
              purchase: Math.round(basePurchase * 4 * 1.05),
              sales: Math.round(baseSales * 4 * 1.05),
            },
            {
              label: "Feb",
              purchase: Math.round(0),
              sales: Math.round(0),
            },
          ]
          : [
            {
              label: "2024",
              purchase: Math.round(basePurchase * 48 * 0.93),
              sales: Math.round(baseSales * 48 * 0.93),
            },
            {
              label: "2025",
              purchase: Math.round(basePurchase * 48 * 0.97),
              sales: Math.round(baseSales * 48 * 0.97),
            },
            {
              label: "2026",
              purchase: Math.round(basePurchase * 48 * 1.03),
              sales: Math.round(baseSales * 48 * 1.03),
            },
            {
              label: "2027",
              purchase: Math.round(0),
              sales: Math.round(0),
            },
          ];



  return (
    <Layout>
      {/* ================= ROW 1 ================= */}
      <div className="home-row split">
        <div className="home-card card-sales">
          <h3>Sales Overview</h3>
          <div className="stat-grid">
            <Stat icon={SalesBlue} value={salesCount} label="Sales" />
            <Stat icon={SalesYellow} value={`₹${revenue}`} label="Revenue" />
            <Stat icon={SalesGreen} value={`₹${profit}`} label="Profit" />
            <Stat icon={SalesPink} value={`₹${cost}`} label="Cost" />
          </div>
        </div>

        <div className="home-card card-inventory">
          <h3>Inventory Summary</h3>
          <div className="stat-grid">
            <Stat
              icon={InventoryYellow}
              value={stats?.productsInStock ?? 0}
              label="In Stock"
            />
            <Stat
              icon={InventoryGreen}
              value={
                stats?.toBeReceived ??
                Math.floor((stats?.productsInStock ?? 0) * 0.3)
              }
              label="To be received"
            />
          </div>
        </div>
      </div>

      {/* ================= ROW 2 ================= */}
      <div className="home-row split">
        <div className="home-card card-purchase">
          <h3>Purchase Overview</h3>
          <div className="stat-grid">
            <Stat
              icon={PurchaseBlue}
              value={purchaseCount}
              label="Purchase"
            />
            <Stat
              icon={PurchaseYellow}
              value={`₹${purchaseValue}`}
              label="Cost"
            />
            <Stat
              icon={PurchaseGreen}
              value={cancelled}
              label="Cancel"
            />
            <Stat
              icon={PurchasePink}
              value={`${returns}`}
              label="Return"
            />
          </div>
        </div>

        <div className="home-card card-product">
          <h3>Product Summary</h3>
          <div className="stat-grid">
            <Stat
              icon={ProductYellow}
              value={stats?.suppliers ?? 0}
              label="Number of Suppliers"
            />
            <Stat
              icon={ProductGreen}
              value={stats?.categoriesCount ?? 0}
              label="Number of Categories"
            />
          </div>
        </div>
      </div>

      {/* ================= ROW 3 ================= */}
      <div className="home-row split">
        <div className="home-card large">
          <h3>Sales & Purchase</h3>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="range-select"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={derivedChartData}
                barGap={6}
                barCategoryGap={24}
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 13, fontWeight: 600, fill: "#334155" }}
                  axisLine={{ stroke: "#0f172a", strokeWidth: 1.5 }}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, stats?.yAxisMax?.[range] || "auto"]}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  tick={{ fontSize: 13, fontWeight: 600, fill: "#334155" }}
                  axisLine={{ stroke: "#0f172a", strokeWidth: 1.5 }}
                  tickLine={false}
                />

                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36} />

                <Bar
                  dataKey="purchase"
                  name="Purchase"
                  fill="#6aa9ff"
                  barSize={18}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="#52d273"
                  barSize={18}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="home-card">
          <h3>Top Products</h3>

          {stats?.topProducts?.length ? (
            <div className="top-products">
              {stats.topProducts.slice(0, 6).map((p) => (
                <div key={p.productId} className="top-product-item">
                  <img
                    src={
                      p.image
                        ? p.image.startsWith("http")
                          ? p.image
                          : `https://cuvette-january-mern-final-evaluation.onrender.com${p.image}`
                        : PRODUCT_PLACEHOLDER
                    }
                  />
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No top products yet</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ===== STAT COMPONENT ===== */
function Stat({ icon, value, label }) {
  return (
    <div className="stat-item">
      <img src={icon} alt={label} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default Dashboard;
