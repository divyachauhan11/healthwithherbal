/**
 * Restores stock for order items when an order is cancelled by an admin.
 * @param {object} options Model dependencies and order details.
 * @returns {Promise<void>}
 */
async function restoreCancelledOrderStock({
  Product,
  InventoryLog,
  orderItems,
  order,
}) {
  for (const item of orderItems) {
    if (!item.productId) continue;
    const product = await Product.findById(item.productId).select("stockQty");
    if (product) {
      const before = product.stockQty || 0;
      const after = before + item.quantity;
      await Product.updateOne(
        { _id: product._id },
        { $inc: { stockQty: item.quantity } },
      );
      await InventoryLog.create({
        productId: product._id,
        orderId: order._id,
        type: "cancel_return",
        quantityChange: item.quantity,
        stockBefore: before,
        stockAfter: after,
        reason: `Order ${order.orderNumber} cancelled by admin`,
      });
    }
  }
}

/**
 * Re-deducts stock when an admin moves an order out of cancelled status.
 * @param {object} options Model dependencies and order details.
 * @returns {Promise<void>}
 */
async function redeductCancelledOrderStock({
  Product,
  InventoryLog,
  orderItems,
  order,
  newStatus,
}) {
  for (const item of orderItems) {
    if (!item.productId) continue;
    const product = await Product.findById(item.productId).select("stockQty");
    if (product) {
      const before = product.stockQty || 0;
      const after = Math.max(0, before - item.quantity);
      await Product.updateOne(
        { _id: product._id },
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
        productId: product._id,
        orderId: order._id,
        type: "sale",
        quantityChange: -item.quantity,
        stockBefore: before,
        stockAfter: after,
        reason: `Order ${order.orderNumber} status changed from cancelled to ${newStatus}`,
      });
    }
  }
}

/**
 * Sets an absolute stock quantity and then records the corresponding log.
 * @param {object} options Update callback, models, and before/after values.
 * @returns {Promise<object>} Updated product document.
 */
async function setAbsoluteStockAndLog({
  updateProduct,
  InventoryLog,
  stockQty,
  before,
  reason,
}) {
  const product = await updateProduct();
  await InventoryLog.create({
    productId: product._id,
    type: stockQty > before.stockQty ? "restock" : "adjustment",
    quantityChange: stockQty - before.stockQty,
    stockBefore: before.stockQty,
    stockAfter: stockQty,
    reason,
  });
  return product;
}

/**
 * Records an inventory log after a product edit changed its stock value.
 * @param {object} options Inventory log model and stock snapshots.
 * @returns {Promise<void>}
 */
async function logEditedProductStockChange({ InventoryLog, before, product }) {
  if (before.stockQty !== product.stockQty) {
    await InventoryLog.create({
      productId: product._id,
      type: product.stockQty > before.stockQty ? "restock" : "adjustment",
      quantityChange: product.stockQty - before.stockQty,
      stockBefore: before.stockQty,
      stockAfter: product.stockQty,
      reason: "Admin inventory update",
    });
  }
}

/**
 * Deducts stock for a newly placed order and records its sale log.
 * @param {object} options Model dependencies and order item details.
 * @returns {Promise<void>}
 */
async function deductStockForNewOrder({
  Product,
  InventoryLog,
  item,
  product,
  order,
}) {
  const before = product ? product.stockQty ?? 0 : 0;
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
}

module.exports = {
  restoreCancelledOrderStock,
  redeductCancelledOrderStock,
  setAbsoluteStockAndLog,
  logEditedProductStockChange,
  deductStockForNewOrder,
};
