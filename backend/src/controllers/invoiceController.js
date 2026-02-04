const Invoice = require("../models/Invoice");
const Product = require("../models/Product");

exports.buyProducts = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    let invoiceItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      // Reduce stock
      product.quantity -= item.quantity;
      await product.save();

      invoiceItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    const invoice = await Invoice.create({
      referenceNumber: `INV-${Date.now()}`,
      items: invoiceItems,
      totalAmount,
      status: "UNPAID",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Buy product error:", error);
    res.status(500).json({ message: "Purchase failed" });
  }
};

exports.getAllInvoices = async (req, res) => {
  const invoices = await Invoice.find().populate("items.product");
  res.json(invoices);
};

exports.updateInvoiceStatus = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  invoice.status = invoice.status === "PAID" ? "UNPAID" : "PAID";
  await invoice.save();

  res.json(invoice);
};

exports.deleteInvoice = async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ message: "Invoice deleted" });
};
