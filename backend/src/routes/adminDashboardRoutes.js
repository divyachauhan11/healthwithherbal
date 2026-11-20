const { USER_ROLES } = require("../constants/roles");
const { ADMIN_PAGE_BY_PATH } = require("../constants/pages");
const config = require("../config");
const { dateKeyInTimeZone, startOfDayInTimeZone } = require("../utils/dateTime");
const {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  RETURN_EXCHANGE_TYPES,
  RETURN_EXCHANGE_STATUSES,
  REFUND_STATUSES,
  BLOG_COMMENT_STATUSES,
  REVIEW_STATUSES,
} = require("../constants/statuses");

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
        canSee(ADMIN_PAGE_BY_PATH.orders) ? Order.find({ $or: [{ createdAt: { $gte: since } }, { updatedAt: { $gte: since } }] }).sort({ updatedAt: -1 }).limit(12).lean() : [],
        canSee(ADMIN_PAGE_BY_PATH.payments) ? Payment.find({ updatedAt: { $gte: since } }).sort({ updatedAt: -1 }).limit(12).lean() : [],
        canSee(ADMIN_PAGE_BY_PATH["return-exchange"]) ? ReturnExchangeRequest.find({ $or: [{ createdAt: { $gte: since } }, { updatedAt: { $gte: since } }] }).sort({ updatedAt: -1 }).limit(12).lean() : [],
        canSee(ADMIN_PAGE_BY_PATH.reviews) ? ProductReview.find({ status: REVIEW_STATUSES[0] }).sort({ createdAt: -1 }).limit(8).lean() : [],
        canSee(ADMIN_PAGE_BY_PATH.blogs) ? BlogComment.find({ status: BLOG_COMMENT_STATUSES[0] }).sort({ createdAt: -1 }).limit(8).lean() : [],
        canSee(ADMIN_PAGE_BY_PATH["low-stock"]) ? Product.find({ active: true, stockQty: { $lte: 10 }, updatedAt: { $gte: since } }).sort({ stockQty: 1, updatedAt: -1 }).limit(8).lean() : [],
      ]);
      const [orders, payments, requests, reviews, comments, lowStock] = tasks;
      const notifications = [
        ...orders.map((order) => ({
          id: `order-${order._id}`,
          type: "order",
          page: ADMIN_PAGE_BY_PATH.orders,
          query: order.orderNumber || "",
          title: new Date(order.updatedAt || order.createdAt) - new Date(order.createdAt) > 1000 ? "Order updated" : "New order placed",
          message: `${order.orderNumber || "Order"} · ${[order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ") || order.customer?.email || "Customer"} · ${String(order.status || ORDER_STATUSES[0]).replaceAll("_", " ")}`,
          createdAt: order.updatedAt || order.createdAt,
        })),
        ...payments.map((payment) => {
          const label = payment.status === PAYMENT_STATUSES[2] ? "Payment received" : payment.status === PAYMENT_STATUSES[3] ? "Payment failed" : payment.status === PAYMENT_STATUSES[4] ? "Payment refunded" : "Payment awaiting collection";
          return {
            id: `payment-${payment._id}`,
            type: "payment",
            page: ADMIN_PAGE_BY_PATH.payments,
            query: String(payment.orderId || ""),
            title: label,
            message: `${String(payment.method || "Payment").replaceAll("_", " ")} · ${new Intl.NumberFormat("en-IN", { style: "currency", currency: payment.currency || "INR" }).format(Number(payment.amount) || 0)}`,
            createdAt: payment.updatedAt || payment.createdAt,
          };
        }),
        ...requests.map((request) => ({
          id: `return-${request._id}`,
          type: request.type,
          page: ADMIN_PAGE_BY_PATH["return-exchange"],
          query: request.orderNumber || "",
          title: request.refundStatus === REFUND_STATUSES[2]
            ? `Refund recorded for ${request.type || RETURN_EXCHANGE_TYPES[0]}`
            : request.refundStatus === REFUND_STATUSES[1]
              ? `Refund pending for ${request.type || RETURN_EXCHANGE_TYPES[0]}`
              : request.status === RETURN_EXCHANGE_STATUSES[0]
                ? `New ${request.type || "return/exchange"} request`
                : `${request.type || "Return/exchange"} request updated`,
          message: `${request.orderNumber || "Order"} · ${request.customer?.name || request.customer?.email || "Customer"}`,
          createdAt: request.updatedAt || request.createdAt,
        })),
        ...reviews.map((review) => ({
          id: `review-${review._id}`,
          type: "review",
          page: ADMIN_PAGE_BY_PATH.reviews,
          query: review.orderNumber || review.userName || "",
          title: "Review awaiting approval",
          message: `${review.userName || "Customer"} · ${review.rating || "—"} star${review.rating === 1 ? "" : "s"}`,
          createdAt: review.createdAt,
        })),
        ...comments.map((comment) => ({
          id: `comment-${comment._id}`,
          type: "comment",
          page: ADMIN_PAGE_BY_PATH.blogs,
          query: comment.authorName || "",
          title: "Blog comment awaiting moderation",
          message: `${comment.authorName || "Reader"} · ${String(comment.content || "").slice(0, 90)}`,
          createdAt: comment.createdAt,
        })),
        ...lowStock.map((product) => ({
          id: `stock-${product._id}`,
          type: "inventory",
          page: ADMIN_PAGE_BY_PATH["low-stock"],
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
      const dailyRevenueStart = startOfDayInTimeZone(now, config.storeTimeZone, -6);
      const dailyRevenueEnd = startOfDayInTimeZone(now, config.storeTimeZone, 1);

      const getSalesByCategory = (matchStage) =>
        Order.aggregate([
          { $match: { status: { $ne: ORDER_STATUSES[4] }, ...matchStage } },
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
        Order.countDocuments({ status: { $in: [ORDER_STATUSES[0], ORDER_STATUSES[1]] } }),
        Order.aggregate([
          { $match: { status: { $ne: ORDER_STATUSES[4] } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.aggregate([
          {
            $match: {
              status: { $ne: ORDER_STATUSES[4] },
              createdAt: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Promise.all([
          User.distinct("email", { role: USER_ROLES.CUSTOMER }),
          Order.distinct("customer.email"),
        ]).then(([accounts, buyers]) => [
          ...new Set([...accounts, ...buyers].filter(Boolean).map((email) => email.toLowerCase())),
        ]),
        ProductReview.countDocuments(),
        ProductReview.countDocuments({ isApproved: false }),
      ]);
      const [
        dailyRevenueRows,
        recentOrders,
        lowStockProducts,
        salesByCategory,
        monthSalesByCategory,
        catalogCategories,
      ] = await Promise.all([
        Order.aggregate([
          {
            $match: {
              status: { $ne: ORDER_STATUSES[4] },
              createdAt: { $gte: dailyRevenueStart, $lt: dailyRevenueEnd },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: config.storeTimeZone,
                },
              },
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
      const dailyRevenueByDate = new Map(
        dailyRevenueRows.map((entry) => [entry._id, entry]),
      );
      const dailyRevenue = Array.from({ length: 7 }, (_, index) => {
        const day = startOfDayInTimeZone(now, config.storeTimeZone, index - 6);
        const date = dateKeyInTimeZone(day, config.storeTimeZone);
        const entry = dailyRevenueByDate.get(date);
        return { _id: date, revenue: entry?.revenue || 0, orders: entry?.orders || 0 };
      });
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
