const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", sku: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
