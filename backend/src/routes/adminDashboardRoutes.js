function registerAdminDashboardRoutes({
  router,
  asyncHandler,
  Product,
  Order,
  Payment,
  ReturnExchangeRequest,
  BlogComment,
  ProductReview,
  User,
}) {
  router.get(
    "/notifications",
    asyncHandler(async (req, res) => {
      const grantedPages = Array.isArray(req.admin?.pageAccess)
        ? new Set(req.admin.pageAccess)
        : null;
      const canSee = (page) => !grantedPages || grantedPages.has(page);
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const tasks = await Promise.all([
        canSee("Orders") ? Order.find({ $or: [{ createdAt: { $gte: since } }, { updatedAt: { $gte: since } }] }).sort({ updatedAt: -1 }).limit(12).lean() : [],
        canSee("Payments") ? Payment.find({ updatedAt: { $gte: since } }).sort({ updatedAt: -1 }).limit(12).lean() : [],
        canSee("Returns & Exchanges") ? ReturnExchangeRequest.find({ $or: [{ createdAt: { $gte: since } }, { updatedAt: { $gte: since } }] }).sort({ updatedAt: -1 }).limit(12).lean() : [],
        canSee("Reviews") ? ProductReview.find({ status: "pending" }).sort({ createdAt: -1 }).limit(8).lean() : [],
        canSee("Blogs") ? BlogComment.find({ status: "pending" }).sort({ createdAt: -1 }).limit(8).lean() : [],
        canSee("Low Stock") ? Product.find({ active: true, stockQty: { $lte: 10 }, updatedAt: { $gte: since } }).sort({ stockQty: 1, updatedAt: -1 }).limit(8).lean() : [],
      ]);
      const [orders, payments, requests, reviews, comments, lowStock] = tasks;
      const notifications = [
        ...orders.map((order) => ({
          id: `order-${order._id}`,
          type: "order",
          page: "Orders",
          query: order.orderNumber || "",
          title: new Date(order.updatedAt || order.createdAt) - new Date(order.createdAt) > 1000 ? "Order updated" : "New order placed",
          message: `${order.orderNumber || "Order"} · ${[order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ") || order.customer?.email || "Customer"} · ${String(order.status || "placed").replaceAll("_", " ")}`,
          createdAt: order.updatedAt || order.createdAt,
        })),
        ...payments.map((payment) => {
          const label = payment.status === "paid" ? "Payment received" : payment.status === "failed" ? "Payment failed" : payment.status === "refunded" ? "Payment refunded" : "Payment awaiting collection";
          return {
            id: `payment-${payment._id}`,
            type: "payment",
            page: "Payments",
            query: String(payment.orderId || ""),
            title: label,
            message: `${String(payment.method || "Payment").replaceAll("_", " ")} · ${new Intl.NumberFormat("en-IN", { style: "currency", currency: payment.currency || "INR" }).format(Number(payment.amount) || 0)}`,
            createdAt: payment.updatedAt || payment.createdAt,
          };
        }),
        ...requests.map((request) => ({
          id: `return-${request._id}`,
          type: request.type,
          page: "Returns & Exchanges",
          query: request.orderNumber || "",
          title: request.refundStatus === "processed"
            ? `Refund recorded for ${request.type || "return"}`
            : request.refundStatus === "pending"
              ? `Refund pending for ${request.type || "return"}`
              : request.status === "pending"
                ? `New ${request.type || "return/exchange"} request`
                : `${request.type || "Return/exchange"} request updated`,
          message: `${request.orderNumber || "Order"} · ${request.customer?.name || request.customer?.email || "Customer"}`,
          createdAt: request.updatedAt || request.createdAt,
        })),
        ...reviews.map((review) => ({
          id: `review-${review._id}`,
          type: "review",
          page: "Reviews",
          query: review.orderNumber || review.userName || "",
          title: "Review awaiting approval",
          message: `${review.userName || "Customer"} · ${review.rating || "—"} star${review.rating === 1 ? "" : "s"}`,
          createdAt: review.createdAt,
        })),
        ...comments.map((comment) => ({
          id: `comment-${comment._id}`,
          type: "comment",
          page: "Blogs",
          query: comment.authorName || "",
          title: "Blog comment awaiting moderation",
          message: `${comment.authorName || "Reader"} · ${String(comment.content || "").slice(0, 90)}`,
          createdAt: comment.createdAt,
        })),
        ...lowStock.map((product) => ({
          id: `stock-${product._id}`,
          type: "inventory",
          page: "Low Stock",
          query: product.title || "",
          title: Number(product.stockQty) <= 0 ? "Product out of stock" : "Product stock running low",
          message: `${product.title || "Product"} · ${Number(product.stockQty) || 0} units remaining`,
          createdAt: product.updatedAt || product.createdAt,
        })),
      ].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)).slice(0, 40);
      res.json({ items: notifications });
    }),
  );

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
        Promise.all([
          User.distinct("email", { role: "customer" }),
          Order.distinct("customer.email"),
        ]).then(([accounts, buyers]) => [
          ...new Set([...accounts, ...buyers].filter(Boolean).map((email) => email.toLowerCase())),
        ]),
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
