const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    legacyId: { type: Number, required: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    guestEmail: { type: String, trim: true, lowercase: true, index: true },
    shippingRateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingRate",
      default: null,
    },
    orderNumber: { type: String, required: true, unique: true, index: true },
    shippingAddress: { type: mongoose.Schema.Types.Mixed, default: null },
    billingAddress: { type: mongoose.Schema.Types.Mixed, default: null },
    customer: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
      },
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true, default: "" },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (items) => items.length > 0,
    },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, min: 0, default: 0 },
    shippingMethod: { type: String, enum: ["standard", "express", "international_express"], default: "standard" },
    couponCode: { type: String, uppercase: true, trim: true },
    discount: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", immutable: true },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery"],
      default: "cash_on_delivery",
    },
    status: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    trackingId: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Order", orderSchema);
module.exports = mongoose.model("Order", orderSchema);
