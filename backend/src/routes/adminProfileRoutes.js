const { z } = require("zod");
const { ADMIN_ROLES } = require("../constants/roles");
const { validate } = require("../middleware/validate");

function registerAdminProfileRoutes({ router, asyncHandler, User }) {
  const profileSchema = z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().max(30).optional().default(""),
    avatarUrl: z.string().url().or(z.literal("")).optional(),
    avatarPublicId: z.string().max(255).optional(),
  });

  router.get("/profile", asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.admin.email.toLowerCase(), role: { $in: ADMIN_ROLES } })
      .select("name email phone avatarUrl avatarPublicId role pageAccess createdAt")
      .lean();
    if (!user) return res.status(404).json({ error: "Admin profile not found." });
    res.json({ user: { ...user, role: req.admin.role, pageAccess: req.admin.pageAccess ?? user.pageAccess } });
  }));

  router.patch(
    "/profile",
    validate(profileSchema, {
      onInvalid: (res) =>
        res.status(400).json({
          error: "Enter a name and a valid phone number.",
        }),
    }),
    asyncHandler(async (req, res) => {
      const data = req.validatedBody;
      const phone = data.phone.replace(/[^\d+\s().-]/g, "").trim();
      const user = await User.findOneAndUpdate(
        { email: req.admin.email.toLowerCase(), role: { $in: ADMIN_ROLES } },
        {
          $set: {
            name: data.name,
            phone,
            ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
            ...(data.avatarPublicId !== undefined
              ? { avatarPublicId: data.avatarPublicId }
              : {}),
          },
        },
        { new: true, runValidators: true },
      )
        .select("name email phone avatarUrl avatarPublicId role pageAccess createdAt")
        .lean();
      if (!user) return res.status(404).json({ error: "Admin profile not found." });
      res.json({ user: { ...user, role: req.admin.role, pageAccess: req.admin.pageAccess ?? user.pageAccess } });
    }),
  );
}

module.exports = registerAdminProfileRoutes;
