const crypto = require("node:crypto");
const express = require("express");
const mongoose = require("mongoose");
const { z } = require("zod");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Payment = require("../models/Payment");
const InventoryLog = require("../models/InventoryLog");
const StoreSetting = require("../models/StoreSetting");
const ReturnExchangeRequest = require("../models/ReturnExchangeRequest");
const { rateLimit } = require("express-rate-limit");
const asyncHandler = require("../middleware/asyncHandler");
const multer = require("multer");
const { isCloudinaryConfigured, uploadBufferToCloudinary } = require("../services/cloudinary");
const { isCouponExpired } = require("../utils/couponExpiry");
const config = require("../config");
const { sendBrevoEmail } = require("../services/brevoService");

const router = express.Router();
const orderCreateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const requestPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 4, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype?.startsWith("image/")) callback(null, true);
    else callback(new Error("Upload JPG, PNG, WebP, or another image file."));
  },
});
const returnEmailLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many return requests were sent. Please try again later." },
});
const returnEmailSchema = z.object({
  orderNumber: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(254),
  type: z.enum(["return", "exchange"]),
  itemIndex: z.coerce.number().int().min(0).optional(),
  quantity: z.coerce.number().int().min(1).max(20).optional(),
  reason: z.string().trim().max(1000).optional().default(""),
  photoUrls: z.array(z.string().url().max(2048).refine((value) => {
    try { return new URL(value).protocol === "https:"; } catch { return false; }
  })).max(4).optional().default([]),
});
const htmlEscapes = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => htmlEscapes[char]);
const createOrderSchema = z.object({
  customer: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().optional(),
    street: z.string().trim().min(3).max(180),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().max(100).optional().default(""),
    postalCode: z.string().trim().min(2).max(20),
    country: z.string().trim().min(2).max(80),
  }),
  phone: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  orderNote: z.string().trim().optional(),
  shippingMethod: z.enum(["standard", "express", "international_express"]).optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
  couponCode: z.string().trim().optional(),
});

const returnExchangeSchema = z.object({
  orderNumber: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(254),
  type: z.enum(["return", "exchange"]),
  itemIndex: z.coerce.number().int().min(0),
  quantity: z.coerce.number().int().min(1).max(20),
  reason: z.string().trim().min(5).max(1000),
});

router.post("/return-exchange", orderCreateLimit, asyncHandler(async (req, res) => {
  const featureSetting = await StoreSetting.findOne({ key: "returnExchangeEnabled" }).lean();
  if (featureSetting?.value === false) return res.status(403).json({ error: "Online return and exchange requests are currently unavailable. Please email our support team." });
  const parsed = returnExchangeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter a valid order, email, item, quantity, and reason." });
  const { orderNumber, email, type, itemIndex, quantity, reason } = parsed.data;
  const order = await Order.findOne({ orderNumber: orderNumber.trim(), "customer.email": email.trim().toLowerCase() });
  if (!order) return res.status(404).json({ error: "We couldn’t find an order matching that number and email." });
  if (order.status !== "delivered") return res.status(400).json({ error: "Return and exchange requests are available after delivery." });
  const item = order.items[itemIndex];
  if (!item || quantity > item.quantity) return res.status(400).json({ error: "Choose an item and quantity from this order." });
  const alreadyRequested = await ReturnExchangeRequest.findOne({
    orderId: order._id,
    $or: [
      { itemIndex },
      { itemIndex: { $exists: false }, "item.title": item.title },
    ],
  }).select("_id").lean();
  if (alreadyRequested) return res.status(409).json({ error: "A return or exchange request has already been submitted for this item." });
  let request;
  try {
    request = await ReturnExchangeRequest.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      customer: { name: `${order.customer.firstName} ${order.customer.lastName}`, email: order.customer.email },
      type,
      itemIndex,
      item: { title: item.title, image: item.image, unitPrice: item.unitPrice },
      quantity,
      reason,
      photos: Array.isArray(req.body.photoUrls) ? req.body.photoUrls.filter((url) => {
        try { return typeof url === "string" && new URL(url).protocol === "https:"; } catch { return false; }
      }).slice(0, 4) : [],
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "A return or exchange request has already been submitted for this item." });
    throw error;
  }
  res.status(201).json({
    success: true,
    requestId: request._id,
    request: {
      _id: request._id,
      type: request.type,
      itemIndex: request.itemIndex,
      item: request.item,
      quantity: request.quantity,
      status: request.status,
      createdAt: request.createdAt,
    },
  });
}));

router.post("/return-exchange/email", returnEmailLimit, asyncHandler(async (req, res) => {
  const parsed = returnEmailSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter valid order and return request details." });
  if (!config.brevoApiKey || config.brevoApiKey === "your_brevo_api_key_here") {
    return res.status(503).json({ error: "Direct email sending is not configured. Please contact healthwithherbalindia@gmail.com." });
  }

  const { orderNumber, email, type, itemIndex, quantity, reason, photoUrls } = parsed.data;
  const cleanEmail = email.toLowerCase();
  const order = await Order.findOne({
    orderNumber,
    $or: [
      { "customer.email": cleanEmail },
      { guestEmail: cleanEmail },
      { "shippingAddress.email": cleanEmail },
    ],
  }).lean();
  if (!order) return res.status(404).json({ error: "We could not find an order matching that number and email." });
  if (String(order.status || "").toLowerCase() !== "delivered") {
    return res.status(400).json({ error: "Return and exchange requests are available after delivery." });
  }
  const item = itemIndex == null ? null : order.items?.[itemIndex];
  if (itemIndex != null && (!item || !quantity || quantity > item.quantity)) {
    return res.status(400).json({ error: "Choose a product and quantity from this order." });
  }
  const customerName = [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ") || "Customer";
  const requestType = type === "return" ? "Return for refund" : "Exchange";
  const requestedProduct = item ? `${item.title} · quantity ${quantity}` : "All items / not sure";
  const shipping = order.shippingAddress || order.customer || {};
  const address = [shipping.street || shipping.line1 || shipping.addressLine1, shipping.line2 || shipping.addressLine2, shipping.city, shipping.state, shipping.postalCode, shipping.country].filter(Boolean).join(", ") || "Not provided";
  const textContent = [
    `New ${requestType.toLowerCase()} request`,
    "",
    `Order: ${order.orderNumber}`,
    `Order date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Not available"}`,
    `Order status: ${order.status}`,
    `Requested product: ${requestedProduct}`,
    `Customer: ${customerName}`,
    `Email: ${cleanEmail}`,
    `Phone: ${shipping.phone || order.customer?.phone || "Not provided"}`,
    `Delivery address: ${address}`,
    `Order total: ${order.total} ${order.currency || "INR"}`,
    ...(order.couponCode ? [`Coupon applied: ${order.couponCode}`] : []),
    `Reason: ${reason || "Not provided"}`,
    ...(photoUrls.length ? ["", "Photo links:", ...photoUrls] : []),
  ].join("\n");
  const htmlContent = `<h2>New ${escapeHtml(requestType.toLowerCase())} request</h2><p><strong>Order:</strong> ${escapeHtml(order.orderNumber)} (${escapeHtml(order.status)})</p><p><strong>Requested product:</strong> ${escapeHtml(requestedProduct)}</p><p><strong>Customer:</strong> ${escapeHtml(customerName)}</p><p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p><p><strong>Phone:</strong> ${escapeHtml(shipping.phone || order.customer?.phone || "Not provided")}</p><p><strong>Delivery address:</strong> ${escapeHtml(address)}</p><p><strong>Order total:</strong> ${escapeHtml(`${order.total} ${order.currency || "INR"}`)}</p>${order.couponCode ? `<p><strong>Coupon:</strong> ${escapeHtml(order.couponCode)}</p>` : ""}<p><strong>Reason:</strong><br>${escapeHtml(reason || "Not provided")}</p>${photoUrls.length ? `<p><strong>Photos:</strong></p><ul>${photoUrls.map((url) => `<li><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>`).join("")}</ul>` : ""}`;
  try {
    await sendBrevoEmail({
      toEmail: config.contactEmail,
      toName: "Healthwithherbal India",
      ccEmail: cleanEmail,
      subject: `${requestType} request — Order ${order.orderNumber}`,
      htmlContent,
      textContent,
      replyTo: { email: cleanEmail, name: customerName },
    });
    res.json({ success: true, message: "Your request has been emailed to our care team." });
  } catch (error) {
    console.error("Return and exchange email failed:", error.message);
    res.status(502).json({ error: "We could not send your request right now. Please try again or email healthwithherbalindia@gmail.com." });
  }
}));

router.post("/return-exchange/photos", orderCreateLimit, (req, res, next) => {
  requestPhotoUpload.array("photos", 4)(req, res, (error) => {
    if (error) return res.status(400).json({ error: error.message || "Could not read uploaded photos." });
    next();
  });
}, asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: "Choose at least one photo to upload." });
  if (!isCloudinaryConfigured()) return res.status(503).json({ error: "Photo uploads are temporarily unavailable. Please try again later." });
  const folder = process.env.CLOUDINARY_FOLDER || "healthwithherbal";
  const images = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer, {
    folder: `${folder}/return-exchange`,
    public_id: `request-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
  })));
  res.json({ urls: images.map((image) => image.secure_url) });
}));

router.post(
  "/",
  orderCreateLimit,
  asyncHandler(async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({
          error: "Please check the delivery details and order items.",
          details: parsed.error.flatten().fieldErrors,
        });
    }

    const requested = parsed.data.items;
    const quantityTotal = requested.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    if (quantityTotal > 50)
      return res
        .status(400)
        .json({ error: "An order may contain up to 50 items." });

    const ids = [...new Set(requested.map((item) => item.productId))];
    const products = await Product.find({
      legacyId: { $in: ids },
      active: true,
    }).lean();
    const byId = new Map(
      products.map((product) => [product.legacyId, product]),
    );
    if (ids.some((id) => !byId.has(id)))
      return res
        .status(400)
        .json({ error: "One or more products are unavailable." });

    const requestedByProduct = new Map();
    for (const item of requested) {
      requestedByProduct.set(
        item.productId,
        (requestedByProduct.get(item.productId) || 0) + item.quantity,
      );
    }
    for (const [productId, quantity] of requestedByProduct) {
      const product = byId.get(productId);
      const available = Number(product.stockQty ?? 0);
      if (quantity > available) {
        return res.status(409).json({
          error: `${product.title} has only ${available} available. Please update the quantity and try again.`,
        });
      }
    }

    const items = requested.map(({ productId, quantity }) => {
      const product = byId.get(productId);
      return {
        product: product._id,
        legacyId: product.legacyId,
        title: product.title,
        brand: product.brand,
        image: product.image || product.images?.[0] || "",
        quantity,
        unitPrice: product.price,
        lineTotal: Number((product.price * quantity).toFixed(2)),
      };
    });
    const subtotal = Number(
      items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2),
    );
    const country = parsed.data.customer.country.trim().toLowerCase();
    const isDomestic = country === "india";
    const shippingMethod = parsed.data.shippingMethod || (isDomestic ? "standard" : "international_express");
    if ((isDomestic && shippingMethod === "international_express") || (!isDomestic && shippingMethod !== "international_express")) {
      return res.status(400).json({ error: "Choose a delivery option that matches the shipping destination." });
    }
    let shipping = isDomestic ? shippingMethod === "express" ? 99 : 0 : 450;
    let discount = 0;
    let couponCode = undefined;

    if (parsed.data.couponCode) {
      const Coupon = require("../models/Coupon");
      const couponRecord = await Coupon.findOne({
        code: parsed.data.couponCode.toUpperCase(),
        isActive: true,
      });

      if (couponRecord) {
        const meetsMin =
          !couponRecord.minOrderAmount ||
          subtotal >= couponRecord.minOrderAmount;
        const notExpired = !isCouponExpired(couponRecord.expiresAt);
        if (meetsMin && notExpired) {
          couponCode = couponRecord.code;
          if (couponRecord.discountType === "percent") {
            discount = Number(
              ((subtotal * couponRecord.discountValue) / 100).toFixed(2),
            );
            if (couponRecord.maxDiscountAmount) {
              discount = Math.min(discount, couponRecord.maxDiscountAmount);
            }
          } else if (couponRecord.discountType === "fixed") {
            discount = Number(
              Math.min(couponRecord.discountValue, subtotal).toFixed(2),
            );
          } else if (couponRecord.discountType === "free_shipping") {
            shipping = 0;
          }
          await Coupon.updateOne(
            { _id: couponRecord._id },
            { $inc: { usedCount: 1 } },
          );
        }
      }
    }

    const total = Number(
      Math.max(0, subtotal - discount + shipping).toFixed(2),
    );
    const orderNumber = `HWH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const customerPhone =
      req.body.phone ||
      parsed.data.phone ||
      parsed.data.customer.phone ||
      "";
    const orderUserId =
      req.body.userId && mongoose.isValidObjectId(req.body.userId)
        ? req.body.userId
        : parsed.data.userId && mongoose.isValidObjectId(parsed.data.userId)
          ? parsed.data.userId
          : null;
    const orderNote = req.body.orderNote || parsed.data.orderNote || "";

    const order = await Order.create({
      orderNumber,
      shippingMethod,
      userId: orderUserId,
      guestEmail: parsed.data.customer.email,
      customer: {
        ...parsed.data.customer,
        phone: customerPhone,
      },
      shippingAddress: {
        ...parsed.data.customer,
        phone: customerPhone,
      },
      billingAddress: {
        ...parsed.data.customer,
        phone: customerPhone,
      },
      orderNote,
      items,
      subtotal,
      shipping,
      shippingFee: shipping,
      couponCode,
      discount,
      total,
      paymentMethod: "cash_on_delivery",
      status: "placed",
    });

    // Deduct stock quantity in the database and create inventory audit logs
    const stockUpdates = items.map(async (item) => {
      const prod = byId.get(item.legacyId);
      const before = prod ? (prod.stockQty ?? 0) : 0;
      const after = Math.max(0, before - item.quantity);

      await Product.updateOne(
        { _id: item.product },
        [
          {
            $set: {
              stockQty: {
                $max: [0, { $subtract: ["$stockQty", item.quantity] }],
              },
            },
          },
        ],
      );

      await InventoryLog.create({
        productId: item.product,
        orderId: order._id,
        type: "sale",
        quantityChange: -item.quantity,
        stockBefore: before,
        stockAfter: after,
        reason: `Order ${order.orderNumber} placed`,
      });
    });

    await Promise.all([
      OrderItem.insertMany(
        items.map((item) => ({
          orderId: order._id,
          productId: item.product,
          titleSnapshot: item.title,
          skuSnapshot: byId.get(item.legacyId).sku,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
      ),
      Payment.create({
        orderId: order._id,
        method: "cash_on_delivery",
        amount: total,
        currency: order.currency,
        status: "pending",
      }),
      ...stockUpdates,
    ]);
    res.status(201).json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        currency: order.currency,
        subtotal: order.subtotal,
        shipping: order.shipping,
        shippingFee: order.shippingFee,
        shippingMethod: order.shippingMethod,
        discount: order.discount,
        couponCode: order.couponCode,
        total: order.total,
        orderNote: order.orderNote,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
        items,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      },
    });
  }),
);

// -----------------------------------------------------------------------------
// GET /api/orders/:identifier
// Fetch current status and order details by orderNumber or MongoDB _id
// -----------------------------------------------------------------------------
router.get(
  "/:identifier",
  asyncHandler(async (req, res) => {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ error: "Order identifier is required." });
    }

    const query = mongoose.isValidObjectId(identifier)
      ? { $or: [{ _id: identifier }, { orderNumber: identifier }] }
      : { orderNumber: identifier };

    const order = await Order.findOne(query)
      .populate("items.product", "image images legacyId")
      .lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    const returnExchangeRequests = await ReturnExchangeRequest.find({ orderId: order._id })
      .select("type itemIndex item quantity status refundStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        currency: order.currency,
        subtotal: order.subtotal,
        shipping: order.shipping,
        shippingFee: order.shippingFee,
        shippingMethod: order.shippingMethod,
        discount: order.discount,
        couponCode: order.couponCode,
        total: order.total,
        orderNote: order.orderNote,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        items: order.items,
        returnExchangeRequests,
        paymentMethod: order.paymentMethod,
        trackingId: order.trackingId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  }),
);

// -----------------------------------------------------------------------------
// GET /api/orders/:identifier/live
// Real-time Server-Sent Events (SSE) stream for live status updates from admin
// -----------------------------------------------------------------------------
router.get(
  "/:identifier/live",
  asyncHandler(async (req, res) => {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ error: "Order identifier is required." });
    }

    const query = mongoose.isValidObjectId(identifier)
      ? { $or: [{ _id: identifier }, { orderNumber: identifier }] }
      : { orderNumber: identifier };

    const initialOrder = await Order.findOne(query)
      .select("_id orderNumber status updatedAt")
      .lean();

    if (!initialOrder) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    // Push initial status immediately
    res.write(
      `data: ${JSON.stringify({
        orderNumber: initialOrder.orderNumber,
        status: initialOrder.status,
        updatedAt: initialOrder.updatedAt,
      })}\n\n`,
    );

    let lastStatus = initialOrder.status;

    // Poll database every 2 seconds for status change triggered by admin
    const intervalId = setInterval(async () => {
      try {
        const fresh = await Order.findById(initialOrder._id)
          .select("status updatedAt")
          .lean();
        if (fresh && fresh.status !== lastStatus) {
          lastStatus = fresh.status;
          res.write(
            `data: ${JSON.stringify({
              orderNumber: initialOrder.orderNumber,
              status: fresh.status,
              updatedAt: fresh.updatedAt,
            })}\n\n`,
          );
        }
      } catch (e) {
        // Suppress temporary read error
      }
    }, 2000);

    req.on("close", () => {
      clearInterval(intervalId);
    });
  }),
);

module.exports = router;
