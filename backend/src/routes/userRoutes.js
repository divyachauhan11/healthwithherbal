const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Address = require("../models/Address");
const User = require("../models/User");

const router = express.Router();

function normalizePhone(raw) {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// -----------------------------------------------------------------------------
// GET /api/user/orders
// Returns all orders from MongoDB for a given user (by phone, email, or userId)
// -----------------------------------------------------------------------------
router.get("/orders", async (req, res) => {
  try {
    const { phone, email, userId } = req.query;
    const cleanPhone = normalizePhone(phone);
    const cleanEmail = (email || "").trim().toLowerCase();

    const orConditions = [];

    if (userId && mongoose.isValidObjectId(userId)) {
      orConditions.push({ userId: new mongoose.Types.ObjectId(userId) });
    }

    if (cleanEmail) {
      orConditions.push(
        { "customer.email": cleanEmail },
        { guestEmail: cleanEmail },
        { "shippingAddress.email": cleanEmail },
      );
    }

    if (cleanPhone && cleanPhone.length >= 10) {
      const phoneRegex = new RegExp(`${cleanPhone}$`);
      orConditions.push(
        { "shippingAddress.phone": cleanPhone },
        { "shippingAddress.phone": `+91${cleanPhone}` },
        { "shippingAddress.phone": phoneRegex },
        { "customer.phone": cleanPhone },
        { "customer.phone": `+91${cleanPhone}` },
        { "customer.phone": phoneRegex },
      );

      // Also check if any User has this phone and find by their _id
      const dbUser = await User.findOne({
        $or: [
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { phone: phoneRegex },
        ],
      }).select("_id email");

      if (dbUser) {
        orConditions.push({ userId: dbUser._id });
        if (dbUser.email) {
          orConditions.push(
            { "customer.email": dbUser.email.toLowerCase() },
            { guestEmail: dbUser.email.toLowerCase() },
          );
        }
      }
    }

    if (orConditions.length === 0) {
      return res.json({ success: true, count: 0, orders: [] });
    }

    const orders = await Order.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({ error: "Could not fetch user orders." });
  }
});

// -----------------------------------------------------------------------------
// GET /api/user/addresses
// Returns saved addresses from MongoDB for this customer
// -----------------------------------------------------------------------------
router.get("/addresses", async (req, res) => {
  try {
    const { phone, email, userId } = req.query;
    const cleanPhone = normalizePhone(phone);
    const cleanEmail = (email || "").trim().toLowerCase();

    const orConditions = [];

    if (userId && mongoose.isValidObjectId(userId)) {
      orConditions.push({ userId: new mongoose.Types.ObjectId(userId) });
    }

    if (cleanEmail) {
      orConditions.push({ userEmail: cleanEmail });
    }

    if (cleanPhone && cleanPhone.length >= 10) {
      const phoneRegex = new RegExp(`${cleanPhone}$`);
      orConditions.push(
        { userPhone: cleanPhone },
        { userPhone: `+91${cleanPhone}` },
        { userPhone: phoneRegex },
        { phone: cleanPhone },
        { phone: `+91${cleanPhone}` },
        { phone: phoneRegex },
      );
    }

    if (orConditions.length === 0) {
      return res.json({ success: true, count: 0, addresses: [] });
    }

    const addresses = await Address.find({ $or: orConditions })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ error: "Could not fetch saved addresses." });
  }
});

// -----------------------------------------------------------------------------
// POST /api/user/addresses
// Save a new address in MongoDB
// -----------------------------------------------------------------------------
router.post("/addresses", async (req, res) => {
  try {
    const {
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      tag,
      isDefault,
      userPhone,
      userEmail,
      userId,
    } = req.body;

    if (!fullName || !line1 || !city || !postalCode) {
      return res.status(400).json({
        error: "Full name, address line 1, city, and postal code are required.",
      });
    }

    const cleanUserPhone = normalizePhone(userPhone || phone);
    const cleanUserEmail = (userEmail || "").trim().toLowerCase();

    // If marked default, unset default on other addresses for this user
    if (isDefault) {
      const unsetQuery = [];
      if (cleanUserPhone) {
        unsetQuery.push({ userPhone: new RegExp(`${cleanUserPhone}$`) });
      }
      if (cleanUserEmail) {
        unsetQuery.push({ userEmail: cleanUserEmail });
      }
      if (unsetQuery.length > 0) {
        await Address.updateMany({ $or: unsetQuery }, { $set: { isDefault: false } });
      }
    }

    const newAddress = await Address.create({
      userId: userId && mongoose.isValidObjectId(userId) ? userId : null,
      userPhone: cleanUserPhone ? `+91${cleanUserPhone}` : "",
      userEmail: cleanUserEmail,
      fullName: fullName.trim(),
      phone: phone ? String(phone).trim() : cleanUserPhone ? `+91${cleanUserPhone}` : "",
      line1: line1.trim(),
      line2: (line2 || "").trim(),
      city: city.trim(),
      state: (state || "").trim(),
      postalCode: postalCode.trim(),
      country: (country || "India").trim(),
      tag: (tag || "Home").trim(),
      isDefault: Boolean(isDefault),
    });

    return res.status(201).json({
      success: true,
      message: "Address saved successfully.",
      address: newAddress,
    });
  } catch (error) {
    console.error("Error saving address:", error);
    return res.status(500).json({ error: "Could not save address to database." });
  }
});

// -----------------------------------------------------------------------------
// DELETE /api/user/addresses/:id
// Remove a saved address from MongoDB
// -----------------------------------------------------------------------------
router.delete("/addresses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid address ID." });
    }

    await Address.findByIdAndDelete(id);
    return res.json({ success: true, message: "Address deleted." });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ error: "Could not delete address." });
  }
});

module.exports = router;
