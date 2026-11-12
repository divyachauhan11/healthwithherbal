function registerAdminOrderRoutes({
  router,
  asyncHandler,
  Order,
  OrderItem,
  Product,
  InventoryLog,
  orderStatusSchema,
  validId,
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
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id))
        return res.status(400).json({ error: "Invalid order ID." });
      const parsed = orderStatusSchema.safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);

      const existingOrder = await Order.findById(req.params.id);
      if (!existingOrder) return res.status(404).json({ error: "Order not found." });

      const newStatus = parsed.data.status;
      const oldStatus = existingOrder.status;

      // If order was cancelled, restore the stock back to the products
      if (newStatus === "cancelled" && oldStatus !== "cancelled") {
        const orderItems = await OrderItem.find({ orderId: existingOrder._id });
        for (const item of orderItems) {
          if (!item.productId) continue;
          const prod = await Product.findById(item.productId).select("stockQty");
          if (prod) {
            const before = prod.stockQty || 0;
            const after = before + item.quantity;
            await Product.updateOne(
              { _id: prod._id },
              { $inc: { stockQty: item.quantity } },
            );
            await InventoryLog.create({
              productId: prod._id,
              orderId: existingOrder._id,
              type: "cancel_return",
              quantityChange: item.quantity,
              stockBefore: before,
              stockAfter: after,
              reason: `Order ${existingOrder.orderNumber} cancelled by admin`,
            });
          }
        }
      } else if (oldStatus === "cancelled" && newStatus !== "cancelled") {
        // If moving out of cancelled status back to active, re-deduct the stock
        const orderItems = await OrderItem.find({ orderId: existingOrder._id });
        for (const item of orderItems) {
          if (!item.productId) continue;
          const prod = await Product.findById(item.productId).select("stockQty");
          if (prod) {
            const before = prod.stockQty || 0;
            const after = Math.max(0, before - item.quantity);
            await Product.updateOne(
              { _id: prod._id },
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
              productId: prod._id,
              orderId: existingOrder._id,
              type: "sale",
              quantityChange: -item.quantity,
              stockBefore: before,
              stockAfter: after,
              reason: `Order ${existingOrder.orderNumber} status changed from cancelled to ${newStatus}`,
            });
          }
        }
      }

      existingOrder.status = newStatus;
      await existingOrder.save();
      res.json({ item: existingOrder });
    }),
  );

}

module.exports = registerAdminOrderRoutes;
