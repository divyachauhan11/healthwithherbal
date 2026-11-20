const { USER_ROLES } = require("../constants/roles");
const { PAYMENT_STATUSES } = require("../constants/statuses");
const { validateObjectId } = require("../middleware/validateObjectId");

function registerAdminCustomerRoutes({ router, asyncHandler, Order, User, Payment, Address }) {
  router.get(
    "/payments",
    asyncHandler(async (_req, res) => {
      const payments = await Payment.find().sort({ createdAt: -1 }).lean();
      const orderIds = [...new Set(payments.map((payment) => String(payment.orderId)).filter(Boolean))];
      const orders = orderIds.length
        ? await Order.find({ _id: { $in: orderIds } }).lean()
        : [];
      const ordersById = new Map(orders.map((order) => [String(order._id), order]));
      const items = payments.map((payment) => {
        const order = ordersById.get(String(payment.orderId));
        return {
          ...payment,
          orderNumber: order?.orderNumber || "—",
          orderStatus: order?.status || "—",
          orderTotal: order?.total ?? null,
          customer: order?.customer || null,
          order: order || null,
        };
      });
      res.json({ items });
    }),
  );

  router.patch(
    "/payments/:id",
    validateObjectId("id", { message: "Invalid payment ID." }),
    asyncHandler(async (req, res) => {
    const { method, gateway = "", gatewayTxnId = "", amount, currency = "INR", status, paidAt = null } = req.body || {};
    const numericAmount = Number(amount);
    const paidDate = paidAt ? new Date(paidAt) : null;
    if (
      typeof method !== "string" || !method.trim() || method.length > 80 ||
      typeof gateway !== "string" || gateway.length > 120 ||
      typeof gatewayTxnId !== "string" || gatewayTxnId.length > 160 ||
      !Number.isFinite(numericAmount) || numericAmount < 0 || numericAmount > 100000000 ||
      typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency) ||
      !PAYMENT_STATUSES.includes(status) ||
      (paidAt && Number.isNaN(paidDate.getTime()))
    ) return res.status(400).json({ error: "Enter valid payment details." });
    const existingPayment = await Payment.findById(req.params.id).select("gateway status");
    if (!existingPayment) return res.status(404).json({ error: "Payment not found." });
    if (existingPayment.gateway === "payu") {
      return res.status(409).json({ error: "PayU payment records are managed by verified PayU responses." });
    }
    const payment = await Payment.findByIdAndUpdate(req.params.id, {
      method: method.trim(), gateway: gateway.trim(), gatewayTxnId: gatewayTxnId.trim(),
      amount: numericAmount, currency, status, paidAt: paidDate,
    }, { new: true, runValidators: true });
    if (!payment) return res.status(404).json({ error: "Payment not found." });
    res.json({ item: payment });
  }));

  router.get(
    "/customers",
    asyncHandler(async (_req, res) => {
      const [orderCustomers, customerAccounts] = await Promise.all([
        Order.aggregate([
          {
            $group: {
              _id: { $toLower: { $ifNull: ["$customer.email", ""] } },
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
          { $match: { _id: { $ne: "" } } },
          { $sort: { lastOrder: -1 } },
          { $limit: 1000 },
        ]),
        User.find({ role: USER_ROLES.CUSTOMER }).select("name email phone createdAt isActive").lean(),
      ]);

      const customersByEmail = new Map();
      for (const customer of orderCustomers) {
        customersByEmail.set(customer._id, {
          email: customer._id,
          name: customer.name?.trim(),
          hasAccount: false,
          orders: customer.orders,
          spent: customer.spent,
          lastOrder: customer.lastOrder,
        });
      }
      for (const account of customerAccounts) {
        const email = account.email?.toLowerCase();
        if (!email) continue;
        const existing = customersByEmail.get(email);
        customersByEmail.set(email, {
          ...existing,
          email,
          name: account.name || existing?.name || "Customer",
          hasAccount: true,
          isActive: account.isActive !== false,
          phone: account.phone || "",
          orders: existing?.orders || 0,
          spent: existing?.spent || 0,
          lastOrder: existing?.lastOrder || null,
          createdAt: account.createdAt,
        });
      }

      const items = [...customersByEmail.values()]
        .sort(
          (left, right) =>
            new Date(right.lastOrder || right.createdAt || 0) -
            new Date(left.lastOrder || left.createdAt || 0),
        )
        .slice(0, 1000);
      res.json({ items });
    }),
  );

  router.patch(
    "/customers/:email/status",
    asyncHandler(async (req, res) => {
      const email = String(req.params.email || "").trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "A valid customer email is required." });
      }
      if (typeof req.body?.isActive !== "boolean") {
        return res.status(400).json({ error: "Choose whether the customer account is active." });
      }

      const customer = await User.findOneAndUpdate(
        { email, role: USER_ROLES.CUSTOMER },
        { $set: { isActive: req.body.isActive } },
        { new: true, runValidators: true },
      ).select("name email isActive").lean();
      if (!customer) return res.status(404).json({ error: "Customer account not found." });
      res.json({ item: customer });
    }),
  );

  router.get(
    "/customers/detail/:email",
    asyncHandler(async (req, res) => {
      const email = String(req.params.email || "").trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "A valid customer email is required." });
      }

      const [account, orders] = await Promise.all([
        User.findOne({ email, role: USER_ROLES.CUSTOMER })
          .select("name email phone createdAt")
          .lean(),
        Order.find({ "customer.email": email }).sort({ createdAt: -1 }).lean(),
      ]);

      if (!account && !orders.length) {
        return res.status(404).json({ error: "Customer not found." });
      }

      const addressMatch = [{ userEmail: email }];
      if (account?._id) addressMatch.push({ userId: account._id });
      if (account?.phone) addressMatch.push({ userPhone: account.phone });
      const [payments, addresses] = await Promise.all([
        orders.length
          ? Payment.find({ orderId: { $in: orders.map((order) => order._id) } })
              .sort({ createdAt: -1 })
              .lean()
          : Promise.resolve([]),
        Address.find({ $or: addressMatch }).sort({ isDefault: -1, createdAt: -1 }).lean(),
      ]);
      const paymentsByOrder = new Map();
      for (const payment of payments) {
        const key = String(payment.orderId);
        paymentsByOrder.set(key, [...(paymentsByOrder.get(key) || []), payment]);
      }

      const latestOrder = orders[0];
      const customer = {
        name: account?.name || latestOrder?.customer?.name || [
          latestOrder?.customer?.firstName,
          latestOrder?.customer?.lastName,
        ].filter(Boolean).join(" ") || "Customer",
        email,
        phone: account?.phone || latestOrder?.shippingAddress?.phone || latestOrder?.customer?.phone || "",
        createdAt: account?.createdAt || null,
        hasAccount: Boolean(account),
        address: latestOrder?.shippingAddress || latestOrder?.customer || null,
      };

      res.json({
        customer,
        addresses,
        orders: orders.map((order) => ({
          ...order,
          payments: paymentsByOrder.get(String(order._id)) || [],
        })),
      });
    }),
  );

}

module.exports = registerAdminCustomerRoutes;
