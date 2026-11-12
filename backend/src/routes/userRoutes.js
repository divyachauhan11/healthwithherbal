const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Address = require("../models/Address");
const User = require("../models/User");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { requireUserSession } = require("../middleware/userSession");

const router = express.Router();

async function findWishlistProduct(rawId) {
  const value = String(rawId ?? "").trim();
  if (!value) return null;
  if (/^\d+$/.test(value)) {
    return Product.findOne({ legacyId: Number(value) }).select("_id");
  }
  if (!mongoose.isValidObjectId(value)) return null;
  return Product.findById(value).select("_id");
}

router.get("/wishlist", requireUserSession, async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user._id }).populate("productId");
    res.json({ items: items.map((item) => item.productId?.legacyId).filter((id) => id != null) });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Could not fetch your wishlist." });
  }
});

router.post("/wishlist", requireUserSession, async (req, res) => {
  try {
    const productId = req.body?.productId;
    const product = await findWishlistProduct(productId);
    if (!product) return res.status(404).json({ error: "Product not found." });
    await Wishlist.updateOne(
      { userId: req.user._id, productId: product._id },
      { $setOnInsert: { userId: req.user._id, productId: product._id } },
      { upsert: true },
    );
    res.status(201).json({ success: true });
  } catch (error) {
    if (error.code === 11000) return res.json({ success: true });
    console.error("Error saving wishlist item:", error);
    res.status(500).json({ error: "Could not save this wishlist item." });
  }
});

router.delete("/wishlist/:productId", requireUserSession, async (req, res) => {
  try {
    const product = await findWishlistProduct(req.params.productId);
    if (!product) return res.status(404).json({ error: "Product not found." });
    await Wishlist.deleteOne({ userId: req.user._id, productId: product._id });
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    res.status(500).json({ error: "Could not remove this wishlist item." });
  }
});

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

// PUT /api/user/addresses/:id
// Update an existing saved delivery address.
router.put("/addresses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid address ID." });
    }

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
      userPhone,
      userEmail,
      userId: ownerId,
    } = req.body;
    if (!fullName || !line1 || !city || !postalCode) {
      return res.status(400).json({
        error: "Full name, address line 1, city, and postal code are required.",
      });
    }

    const cleanUserPhone = normalizePhone(userPhone || phone);
    const cleanUserEmail = String(userEmail || "").trim().toLowerCase();

    const address = await Address.findByIdAndUpdate(
      id,
      {
        $set: {
          fullName: String(fullName).trim(),
          phone: phone ? String(phone).trim() : "",
          line1: String(line1).trim(),
          line2: String(line2 || "").trim(),
          city: String(city).trim(),
          state: String(state || "").trim(),
          postalCode: String(postalCode).trim(),
          country: String(country || "India").trim(),
          tag: String(tag || "Home").trim(),
          userPhone: cleanUserPhone ? `+91${cleanUserPhone}` : "",
          userEmail: cleanUserEmail,
          userId: ownerId && mongoose.isValidObjectId(ownerId) ? ownerId : null,
        },
      },
      { new: true, runValidators: true },
    );

    if (!address) {
      return res.status(404).json({ error: "Saved address not found." });
    }
    return res.json({ success: true, address });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ error: "Could not update saved address." });
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
