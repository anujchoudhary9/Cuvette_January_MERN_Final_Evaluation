const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const csvUpload = require("../middleware/csvUpload");
const imageUpload = require("../middleware/productImageUpload");

const {
  createProduct,
  getAllProducts,
  buyProduct,
  getProductSales,
  bulkUploadProducts,
} = require("../controllers/productController");

/**
 * SINGLE PRODUCT (with optional image)
 */
router.post("/", createProduct);

/**
 * GET PRODUCTS
 */
router.get("/", auth, getAllProducts);

/**
 * BUY PRODUCT
 */
router.post("/buy", auth, buyProduct);

/**
 * BULK CSV UPLOAD
 */
router.post(
  "/bulk",
  auth,
  csvUpload.single("file"),
  bulkUploadProducts
);

/**
 * PRODUCT SALES
 */
router.get("/:id/sales", auth, getProductSales);

module.exports = router;
