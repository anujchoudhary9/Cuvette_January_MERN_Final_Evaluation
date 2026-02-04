const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  buyProducts,
  getAllInvoices,
  updateInvoiceStatus,
  deleteInvoice,
} = require("../controllers/invoiceController");

router.post("/buy", auth, buyProducts);
router.get("/", auth, getAllInvoices);
router.put("/:id/status", auth, updateInvoiceStatus);
router.delete("/:id", auth, deleteInvoice);

module.exports = router;
