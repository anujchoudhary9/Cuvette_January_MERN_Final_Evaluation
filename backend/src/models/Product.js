const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    /* ===== PURCHASE METRICS (IMMUTABLE) ===== */
    initialQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    initialValue: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
    },

    threshold: {
      type: Number,
      required: true,
      min: 0,
    },

    expiryDate: {
      type: Date,
      required: false,
    },

    image: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"],
      default: "IN_STOCK",
    },
  },
  { timestamps: true }
);

/**
 * FINAL SAFETY NET
 * - Prevents negative stock
 * - Keeps status ALWAYS correct
 */
productSchema.pre("save", function () {
  if (this.quantity < 0) {
    this.quantity = 0;
  }

  if (this.quantity === 0) {
    this.status = "OUT_OF_STOCK";
  } else if (this.quantity <= this.threshold) {
    this.status = "LOW_STOCK";
  } else {
    this.status = "IN_STOCK";
  }
});

module.exports = mongoose.model("Product", productSchema);
