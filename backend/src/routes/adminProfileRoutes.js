const { z } = require("zod");

function registerAdminProfileRoutes({ router, asyncHandler, User }) {
  const profileSchema = z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().max(30).optional().default(""),
    avatarUrl: z.string().url().or(z.literal("")).optional(),
    avatarPublicId: z.string().max(255).optional(),
  });

  router.get("/profile", asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.admin.email.toLowerCase(), role: { $in: ["admin", "employee"] } })
      .select("name email phone avatarUrl avatarPublicId role pageAccess createdAt")
      .lean();
    if (!user) return res.status(404).json({ error: "Admin profile not found." });
    res.json({ user: { ...user, role: req.admin.role, pageAccess: req.admin.pageAccess ?? user.pageAccess } });
  }));

  router.patch("/profile", asyncHandler(async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Enter a name and a valid phone number." });
    const phone = parsed.data.phone.replace(/[^\d+\s().-]/g, "").trim();
    const user = await User.findOneAndUpdate(
      { email: req.admin.email.toLowerCase(), role: { $in: ["admin", "employee"] } },
      { $set: {
        name: parsed.data.name,
        phone,
        ...(parsed.data.avatarUrl !== undefined ? { avatarUrl: parsed.data.avatarUrl } : {}),
        ...(parsed.data.avatarPublicId !== undefined ? { avatarPublicId: parsed.data.avatarPublicId } : {}),
      } },
      { new: true, runValidators: true },
    ).select("name email phone avatarUrl avatarPublicId role pageAccess createdAt").lean();
    if (!user) return res.status(404).json({ error: "Admin profile not found." });
    res.json({ user: { ...user, role: req.admin.role, pageAccess: req.admin.pageAccess ?? user.pageAccess } });
  }));
}

module.exports = registerAdminProfileRoutes;
