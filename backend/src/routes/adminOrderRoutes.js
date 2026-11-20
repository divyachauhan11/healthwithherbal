const inventoryService = require("../services/inventoryService");
const { ORDER_STATUSES } = require("../constants/statuses");
const { validate } = require("../middleware/validate");
const { validateObjectId } = require("../middleware/validateObjectId");

function registerAdminOrderRoutes({
  router,
  asyncHandler,
  Order,
  Payment,
  OrderItem,
  Product,
  InventoryLog,
  orderStatusSchema,
  invalid,
}) {
  router.get(
    "/orders",
    asyncHandler(async (_req, res) => {
      const items = await Order.find().sort({ createdAt: -1 }).limit(500).lean();
      const payments = await Payment.find({ orderId: { $in: items.map((order) => order._id) } })
        .select("orderId status gateway gatewayTxnId")
        .lean();
      const paymentByOrder = new Map(payments.map((payment) => [String(payment.orderId), payment]));
      res.json({
        items: items.map((order) => ({
          ...order,
          paymentStatus: paymentByOrder.get(String(order._id))?.status || "pending",
          paymentGateway: paymentByOrder.get(String(order._id))?.gateway || "",
          gatewayTxnId: paymentByOrder.get(String(order._id))?.gatewayTxnId || "",
        })),
      });
    }),
  );
  router.patch(
    "/orders/:id",
    validateObjectId("id", { message: "Invalid order ID." }),
    validate(orderStatusSchema, { onInvalid: invalid }),
    asyncHandler(async (req, res) => {
      const existingOrder = await Order.findById(req.params.id);
      if (!existingOrder) return res.status(404).json({ error: "Order not found." });

      const newStatus = req.validatedBody.status;
      const oldStatus = existingOrder.status;
      if (existingOrder.paymentMethod === "payu") {
        const payment = await Payment.findOne({ orderId: existingOrder._id }).select("status").lean();
        if (payment?.status === "pending") {
          return res.status(409).json({ error: "Wait for PayU to confirm or fail this transaction before changing the order." });
        }
        if (payment?.status === "failed" && newStatus !== "cancelled") {
          return res.status(409).json({ error: "A failed PayU order cannot be fulfilled." });
        }
        if (payment?.status === "paid" && newStatus === "cancelled") {
          return res.status(409).json({ error: "Refund the PayU payment before cancelling this order." });
        }
      }

      // If order was cancelled, restore the stock back to the products
      if (newStatus === ORDER_STATUSES[4] && oldStatus !== ORDER_STATUSES[4]) {
        const orderItems = await OrderItem.find({ orderId: existingOrder._id });
        await inventoryService.restoreCancelledOrderStock({
          Product,
          InventoryLog,
          orderItems,
          order: existingOrder,
        });
      } else if (oldStatus === ORDER_STATUSES[4] && newStatus !== ORDER_STATUSES[4]) {
        // If moving out of cancelled status back to active, re-deduct the stock
        const orderItems = await OrderItem.find({ orderId: existingOrder._id });
        await inventoryService.redeductCancelledOrderStock({
          Product,
          InventoryLog,
          orderItems,
          order: existingOrder,
          newStatus,
        });
      }

      existingOrder.status = newStatus;
      await existingOrder.save();
      res.json({ item: existingOrder });
    }),
  );

}

module.exports = registerAdminOrderRoutes;
