const mongoose = require("mongoose");
const schema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, countries: [String], states: [String], pincodePrefixes: [String], isActive: { type: Boolean, default: true } }, { timestamps: true, versionKey: false });
module.exports = mongoose.model("ShippingZone", schema, "shipping_zones");
