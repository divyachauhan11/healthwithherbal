function registerAdminCustomerRoutes({ router, asyncHandler, Order }) {
    router.get(
    "/customers",
    asyncHandler(async (_req, res) => {
      const items = await Order.aggregate([
        {
          $group: {
            _id: "$customer.email",
            name: {
              $first: {
                $concat: ["$customer.firstName", " ", "$customer.lastName"],
              },
            },
            orders: { $sum: 1 },
            spent: { $sum: "$total" },
            lastOrder: { $max: "$createdAt" },
          },
        },
        { $sort: { lastOrder: -1 } },
        { $limit: 500 },
      ]);
      res.json({
        items: items.map((item) => ({
          email: item._id,
          name: item.name,
          orders: item.orders,
          spent: item.spent,
          lastOrder: item.lastOrder,
        })),
      });
    }),
  );

}

module.exports = registerAdminCustomerRoutes;
