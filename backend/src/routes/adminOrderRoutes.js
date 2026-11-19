const inventoryService = require("../services/inventoryService");
const { ORDER_STATUSES } = require("../constants/statuses");
const { validate } = require("../middleware/validate");
const { validateObjectId } = require("../middleware/validateObjectId");

function registerAdminOrderRoutes({
  router,
  asyncHandler,
  Order,
  OrderItem,
  Product,
  InventoryLog,
  orderStatusSchema,
  invalid,
}) {
  router.get(
    "/orders",
    asyncHandler(async (_req, res) =>
      res.json({
        items: await Order.find().sort({ createdAt: -1 }).limit(500).lean(),
      }),
    ),
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
