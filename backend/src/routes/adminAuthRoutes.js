const crypto = require("node:crypto");
const {
  createAdminToken,
  requireAdmin,
  safeEqual,
} = require("../middleware/adminAuth");
const { requirePageAccess } = require("../middleware/adminPageAccess");

function registerAdminAuthRoutes({
  router,
  asyncHandler,
  loginSchema,
  adminPortalPages,
  invalid,
  User,
}) {
  router.post(
    "/auth/login",
    asyncHandler(async (req, res) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return invalid(res, parsed);

      const email = process.env.ADMIN_EMAIL || "";
      const password = process.env.ADMIN_PASSWORD || "";
      const secret = process.env.ADMIN_SESSION_SECRET || "";
      if (secret.length < 32) {
        return res.status(503).json({
          error:
            "Set an ADMIN_SESSION_SECRET of at least 32 characters in the backend environment first.",
        });
      }

      const isConfiguredAdmin = Boolean(
        email &&
          password &&
          safeEqual(parsed.data.email.toLowerCase(), email.toLowerCase()) &&
          safeEqual(parsed.data.password, password),
      );
      if (isConfiguredAdmin) {
        await User.updateOne(
          { email: email.toLowerCase() },
          {
            $setOnInsert: {
              name: "Store administrator",
              email: email.toLowerCase(),
              role: "admin",
              isActive: true,
              passwordHash: crypto.randomBytes(32).toString("hex"),
            },
          },
          { upsert: true },
        );

        return res.json({
          token: createAdminToken(email.toLowerCase(), secret, {
            role: "admin",
            name: "Store administrator",
            pageAccess: adminPortalPages,
          }),
          user: {
            name: "Store administrator",
            email: email.toLowerCase(),
            role: "admin",
            pageAccess: adminPortalPages,
          },
        });
      }

      const staff = await User.findOne({
        email: parsed.data.email.toLowerCase(),
        role: { $in: ["admin", "employee"] },
      }).select("+passwordHash");
      const [scheme, salt, expectedHash] = (staff?.passwordHash || "").split("$");
      let passwordMatches = false;

      if (staff?.isActive && scheme === "scrypt" && salt && expectedHash) {
        const actualHash = crypto.scryptSync(parsed.data.password, salt, 64);
        const expected = Buffer.from(expectedHash, "hex");
        passwordMatches =
          expected.length === actualHash.length &&
          crypto.timingSafeEqual(expected, actualHash);
      }

      if (!passwordMatches) {
        return res.status(401).json({
          error: "Email or password is incorrect, or this account is disabled.",
        });
      }

      const claims = {
        role: staff.role,
        pageAccess: staff.pageAccess || [],
        userId: String(staff._id),
        name: staff.name,
      };
      res.json({
        token: createAdminToken(staff.email, secret, claims),
        user: {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          pageAccess: claims.pageAccess,
        },
      });
    }),
  );

  router.get(
    "/auth/session",
    requireAdmin,
    asyncHandler(async (req, res) => {
      if (!req.admin.userId) {
        const pageAccess = req.admin.pageAccess || adminPortalPages;
        return res.json({
          user: {
            name: "Store administrator",
            email: req.admin.email,
            role: "admin",
            pageAccess,
          },
        });
      }

      const staff = await User.findById(req.admin.userId)
        .select("name email role isActive pageAccess")
        .lean();
      if (!staff || !staff.isActive || !["admin", "employee"].includes(staff.role)) {
        return res.status(401).json({
          error: "This admin account is no longer active. Please sign in again.",
        });
      }

      const pageAccess = staff.pageAccess || [];
      res.json({
        user: {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          pageAccess,
        },
      });
    }),
  );

  router.use(requireAdmin, requirePageAccess);
}

module.exports = registerAdminAuthRoutes;
