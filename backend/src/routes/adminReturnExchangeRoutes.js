function registerAdminReturnExchangeRoutes({ router, asyncHandler, Request, Order, Payment, validId }) {
  router.get("/return-exchange", asyncHandler(async (_req, res) => {
    const items = await Request.find().sort({ createdAt: -1 }).limit(500).lean();
    const orderIds = [...new Set(items.map((item) => String(item.orderId)).filter(validId))];
    const orderNumbers = [...new Set(items.map((item) => String(item.orderNumber || "").trim()).filter(Boolean))];
    const orders = await Order.find({
      $or: [
        { _id: { $in: orderIds } },
        { orderNumber: { $in: orderNumbers } },
      ],
    }).lean();
    const orderIdsForPayments = [...new Set(orders.map((order) => String(order._id)))];
    const payments = await Payment.find({ orderId: { $in: orderIdsForPayments } })
      .sort({ createdAt: -1 })
      .lean();
    const ordersById = new Map(orders.map((order) => [String(order._id), order]));
    const ordersByNumber = new Map(orders.map((order) => [String(order.orderNumber).trim(), order]));
    const paymentsByOrderId = new Map();
    for (const payment of payments) {
      const key = String(payment.orderId);
      paymentsByOrderId.set(key, [...(paymentsByOrderId.get(key) || []), payment]);
    }
    res.json({
      items: items.map((item) => ({
        ...item,
        order: ordersById.get(String(item.orderId)) || ordersByNumber.get(String(item.orderNumber || "").trim()) || null,
        payments: paymentsByOrderId.get(String((ordersById.get(String(item.orderId)) || ordersByNumber.get(String(item.orderNumber || "").trim()))?._id)) || [],
      })),
    });
  }));

  router.patch("/return-exchange/:id", asyncHandler(async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid request ID." });
    const {
      status,
      adminNote = "",
      refundStatus = "pending",
      refundAmount = 0,
      refundMethod = "not_applicable",
      refundReference = "",
    } = req.body || {};
    const amount = Number(refundAmount);
    const refundStatuses = ["not_required", "pending", "processed"];
    const refundMethods = ["not_applicable", "original_payment", "bank_transfer", "cash", "store_credit", "other"];
    if (
      !["pending", "approved", "rejected", "completed"].includes(status) ||
      typeof adminNote !== "string" || adminNote.length > 1000 ||
      !refundStatuses.includes(refundStatus) || !Number.isFinite(amount) || amount < 0 || amount > 100000000 ||
      !refundMethods.includes(refundMethod) || typeof refundReference !== "string" || refundReference.length > 120 ||
      (refundStatus !== "not_required" && refundMethod === "not_applicable")
    ) {
      return res.status(400).json({ error: "Enter a valid request status and refund details. Choose a refund method when recording a refund." });
    }
    const existing = await Request.findById(req.params.id).select("refundProcessedAt item quantity");
    if (!existing) return res.status(404).json({ error: "Request not found." });
    const itemValue = Number(existing.item?.unitPrice) * Number(existing.quantity);
    if (refundStatus !== "not_required" && Number.isFinite(itemValue) && itemValue > 0 && amount > itemValue + 0.01) {
      return res.status(400).json({ error: `Refund amount cannot exceed the requested item's value (${itemValue.toFixed(2)}).` });
    }
    const item = await Request.findByIdAndUpdate(req.params.id, {
      status,
      adminNote: adminNote.trim(),
      refundStatus,
      refundAmount: amount,
      refundMethod,
      refundReference: refundReference.trim(),
      refundProcessedAt: refundStatus === "processed" ? existing.refundProcessedAt || new Date() : null,
    }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: "Request not found." });
    res.json({ item });
  }));
}
module.exports = registerAdminReturnExchangeRoutes;
