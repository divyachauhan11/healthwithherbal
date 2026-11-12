function registerAdminDashboardRoutes({
  router,
  asyncHandler,
  Product,
  Order,
  ProductReview,
}) {
  router.get(
    "/dashboard",
    asyncHandler(async (_req, res) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const getSalesByCategory = (matchStage) =>
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" }, ...matchStage } },
          { $unwind: "$items" },
          {
            $lookup: {
              from: "products",
              let: { prodId: "$items.product", legId: "$items.legacyId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: ["$_id", "$$prodId"] },
                        { $eq: ["$legacyId", "$$legId"] },
                      ],
                    },
                  },
                },
                { $project: { category: 1 } },
                { $limit: 1 },
              ],
              as: "productDoc",
            },
          },
          { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: { $ifNull: ["$productDoc.category", "Other"] },
              revenue: { $sum: { $ifNull: ["$items.lineTotal", 0] } },
              units: { $sum: { $ifNull: ["$items.quantity", 1] } },
            },
          },
          { $sort: { revenue: -1 } },
        ]);

      const lowStockFilter = {
        active: true,
        $or: [
          { stockQty: { $lte: 0 } },
          {
            $expr: {
              $lte: ["$stockQty", { $ifNull: ["$lowStockThreshold", 10] }],
            },
          },
        ],
      };

      const [
        productCount,
        activeProducts,
        lowStock,
        orderCount,
        pendingOrders,
        revenue,
        monthRevenueRows,
        customerRows,
        reviewCount,
        pendingReviews,
      ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ active: true }),
        Product.countDocuments(lowStockFilter),
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ["placed", "processing"] } }),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.aggregate([
          {
            $match: {
              status: { $ne: "cancelled" },
              createdAt: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.distinct("customer.email"),
        ProductReview.countDocuments(),
        ProductReview.countDocuments({ isApproved: false }),
      ]);
      const [
        dailyRevenue,
        recentOrders,
        lowStockProducts,
        salesByCategory,
        monthSalesByCategory,
        catalogCategories,
      ] = await Promise.all([
        Order.aggregate([
          {
            $match: {
              status: { $ne: "cancelled" },
              createdAt: { $gte: new Date(Date.now() - 7 * 86400000) },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.find().sort({ createdAt: -1 }).limit(7).lean(),
        Product.find(lowStockFilter).sort({ stockQty: 1, title: 1 }).lean(),
        getSalesByCategory({}),
        getSalesByCategory({ createdAt: { $gte: startOfMonth } }),
        Product.aggregate([
          { $match: { active: true } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);
      res.json({
        stats: {
          productCount,
          activeProducts,
          lowStock,
          orderCount,
          pendingOrders,
          revenue: revenue[0]?.total || 0,
          monthRevenue: monthRevenueRows[0]?.total || 0,
          currency: "INR",
          customerCount: customerRows.length,
          reviewCount,
          pendingReviews,
        },
        dailyRevenue,
        recentOrders,
        lowStockProducts,
        salesByCategory,
        monthSalesByCategory,
        catalogCategories,
      });
    }),
  );

}

module.exports = registerAdminDashboardRoutes;
