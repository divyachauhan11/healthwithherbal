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
      const item = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
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
      item.name = data.name;
      item.email = data.email.toLowerCase();
      item.role = data.role;
      item.isActive = data.isActive;
      item.pageAccess = data.pageAccess;
      if (data.password) item.passwordHash = hashStaffPassword(data.password);
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
