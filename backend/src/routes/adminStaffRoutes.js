const crypto = require("node:crypto");

function hashStaffPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function registerAdminStaffRoutes({
  router,
  asyncHandler,
  User,
  staffUserSchema,
  staffUserUpdateSchema,
  validId,
  invalid,
}) {
  router.get(
    "/users",
    asyncHandler(async (_req, res) =>
      res.json({
        items: await User.find({ role: { $in: ["admin", "employee"] } })
          .sort({ createdAt: -1 })
          .limit(500)
          .lean(),
      }),
    ),
  );

  router.post(
    "/users",
    asyncHandler(async (req, res) => {
      const parsed = staffUserSchema.safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);
      const data = parsed.data;
      const normalizedEmail = data.email.toLowerCase();
      const existingAccount = await User.exists({
        email: normalizedEmail,
        role: { $in: ["admin", "employee"] },
      });
      if (existingAccount) {
        return res.status(409).json({
          error: "This email address is already registered to an account. Use a different email address.",
        });
      }
      const item = await User.create({
        name: data.name,
        email: normalizedEmail,
        role: data.role,
        isActive: data.isActive,
        pageAccess: data.pageAccess,
        passwordHash: hashStaffPassword(data.password),
      });
      const safeItem = item.toObject();
      delete safeItem.passwordHash;
      res.status(201).json({ item: safeItem });
    }),
  );

  router.put(
    "/users/:id",
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid user ID." });
      const parsed = staffUserUpdateSchema.safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);
      const data = parsed.data;
      const item = await User.findOne({ _id: req.params.id, role: { $in: ["admin", "employee"] } }).select("+passwordHash");
      if (!item) return res.status(404).json({ error: "User not found." });
      const currentAccess = [...(item.pageAccess || [])].sort();
      const nextAccess = [...data.pageAccess].sort();
      const pageAccessChanged = currentAccess.length !== nextAccess.length ||
        currentAccess.some((page, index) => page !== nextAccess[index]);
      const invalidatesSessions =
        item.isActive !== data.isActive ||
        item.role !== data.role ||
        item.email.toLowerCase() !== data.email.toLowerCase() ||
        pageAccessChanged ||
        Boolean(data.password);

      item.name = data.name;
      item.email = data.email.toLowerCase();
      item.role = data.role;
      item.isActive = data.isActive;
      item.pageAccess = data.pageAccess;
      if (data.password) item.passwordHash = hashStaffPassword(data.password);
      if (invalidatesSessions) item.authVersion = (Number(item.authVersion) || 0) + 1;
      await item.save();
      const safeItem = item.toObject();
      delete safeItem.passwordHash;
      res.json({ item: safeItem });
    }),
  );

  router.delete(
    "/users/:id",
    asyncHandler(async (req, res) => {
      if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid user ID." });
      const item = await User.findOne({ _id: req.params.id, role: { $in: ["admin", "employee"] } });
      if (!item) return res.status(404).json({ error: "User not found." });
      if (item.email.toLowerCase() === req.admin.email.toLowerCase()) {
        return res.status(400).json({ error: "You cannot delete the account you are currently signed in with." });
      }
      if (item.role === "admin" && await User.countDocuments({ role: "admin", isActive: true }) <= 1) {
        return res.status(400).json({ error: "The last active admin account cannot be deleted." });
      }
      await item.deleteOne();
      res.json({ success: true });
    }),
  );

}

module.exports = registerAdminStaffRoutes;
