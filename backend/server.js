const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const statisticsRoutes = require("./src/routes/statisticsRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");

const app = express();

/* ===== CORS (IMPORTANT) ===== */
app.use(
  cors({
    origin: [
      "https://cuvette-inventory.netlify.app",
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ===== BODY PARSER ===== */
app.use(express.json());

/* ===== STATIC FILES ===== */
app.use(
  "/uploads/products",
  express.static(path.join(__dirname, "uploads/products"))
);

/* ===== ROUTES ===== */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/invoices", invoiceRoutes);

/* ===== DATABASE ===== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

/* ===== SERVER ===== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
