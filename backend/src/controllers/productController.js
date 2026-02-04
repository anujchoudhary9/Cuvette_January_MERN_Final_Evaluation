const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const mongoose = require("mongoose");
const csv = require("csv-parser");
const stream = require("stream");

/**
 * CREATE PRODUCT (SINGLE)
 * Supports optional image upload (local storage)
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      quantity,
      unit,
      threshold,
      expiryDate,
    } = req.body;

    if (
      !name ||
      !category ||
      price == null ||
      quantity == null ||
      !unit ||
      threshold == null
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      category,
      price,
      quantity,

      initialQuantity: quantity,
      initialValue: price * quantity,

      unit,
      threshold,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      image: req.body.image || null,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET ALL PRODUCTS
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/**
 * BUY PRODUCT → CREATES INVOICE (ATOMIC)
 */
exports.buyProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    let totalAmount = 0;
    const invoiceItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) throw new Error("Product not found");
      if (product.quantity < item.quantity)
        throw new Error("Insufficient stock");

      product.quantity -= item.quantity;
      await product.save({ session });

      invoiceItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });

      totalAmount += item.quantity * product.price;
    }

    const invoice = await Invoice.create(
      [
        {
          referenceNumber: `INV-${Date.now()}`,
          items: invoiceItems,
          totalAmount,
          status: "UNPAID",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(invoice[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Buy product error:", err);
    res.status(500).json({ message: "Purchase failed" });
  }
};

/**
 * BULK PRODUCT UPLOAD (CSV)
 */
exports.bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const products = [];
    const invalidRows = [];

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on("data", (row) => {
        const qty = Number(row.quantity);
        const price = Number(row.price);
        const threshold = Number(row.threshold);

        // 🚨 STRICT VALIDATION
        if (
          !row.name ||
          !row.category ||
          !row.unit ||
          isNaN(price) ||
          isNaN(qty) ||
          isNaN(threshold)
        ) {
          invalidRows.push(row);
          return;
        }

        products.push({
          name: row.name,
          category: row.category,
          price,
          quantity: qty,

          initialQuantity: qty,
          initialValue: price * qty,

          unit: row.unit,
          threshold,
          expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
          image: row.imageUrl
            ? row.imageUrl.startsWith("http")
              ? row.imageUrl
              : `${req.protocol}://${req.get("host")}${row.imageUrl}`
            : null,

        });
      })
      .on("end", async () => {
        if (!products.length) {
          return res.status(400).json({
            message: "No valid rows found in CSV",
            invalidRowsCount: invalidRows.length,
          });
        }

        await Product.insertMany(products);

        res.json({
          message: "CSV uploaded successfully",
          inserted: products.length,
          skipped: invalidRows.length,
        });
      });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ message: "Bulk upload failed" });
  }
};

/**
 * PRODUCT SALES (FROM PAID INVOICES ONLY)
 */
exports.getProductSales = async (req, res) => {
  try {
    const productId = req.params.id;

    const stats = await Invoice.aggregate([
      { $match: { status: "PAID" } },
      { $unwind: "$items" },
      {
        $match: {
          "items.product": new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$items.product",
          quantitySold: { $sum: "$items.quantity" },
          revenue: {
            $sum: {
              $multiply: ["$items.quantity", "$items.priceAtPurchase"],
            },
          },
        },
      },
    ]);

    if (!stats.length) {
      return res.json({ productId, quantitySold: 0, revenue: 0 });
    }

    res.json({
      productId,
      quantitySold: stats[0].quantitySold,
      revenue: stats[0].revenue,
    });
  } catch (err) {
    console.error("Product sales error:", err);
    res.status(500).json({ message: "Failed to fetch product sales" });
  }
};


