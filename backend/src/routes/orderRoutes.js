const crypto = require("node:crypto");
const express = require("express");
const mongoose = require("mongoose");
const { z } = require("zod");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Payment = require("../models/Payment");
const InventoryLog = require("../models/InventoryLog");
const { rateLimit } = require("express-rate-limit");
const asyncHandler = require("../middleware/asyncHandler");
const { isCouponExpired } = require("../utils/couponExpiry");

const router = express.Router();
const orderCreateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
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
    let shipping = subtotal >= 75 ? 0 : 8;
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
        discount: order.discount,
        couponCode: order.couponCode,
        total: order.total,
        orderNote: order.orderNote,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        items: order.items,
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
