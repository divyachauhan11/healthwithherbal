const crypto = require("node:crypto");
const {
  createAdminToken,
  requireAdmin,
  safeEqual,
} = require("../middleware/adminAuth");
const { requirePageAccess } = require("../middleware/adminPageAccess");
const createForgotPasswordController = require("../controllers/forgotPasswordController");
const createResetPasswordController = require("../controllers/resetPasswordController");

function registerAdminAuthRoutes({
  router,
  asyncHandler,
  loginSchema,
  adminPortalPages,
  invalid,
  User,
}) {
  router.post(
    "/auth/forgot-password",
    asyncHandler(createForgotPasswordController({ User })),
  );
  router.post(
    "/auth/reset-password",
    asyncHandler(createResetPasswordController({ User })),
  );

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
        const rootAdmin = await User.findOne({
          email: email.toLowerCase(),
          role: "admin",
        }).select("+passwordHash name email avatarUrl role isActive pageAccess authVersion");
        if (!rootAdmin || !rootAdmin.isActive) {
          return res.status(401).json({
            error: "The configured admin account is missing or disabled. Ask another administrator to restore access.",
          });
        }

        const [rootScheme, rootSalt, rootHash] = (rootAdmin.passwordHash || "").split("$");
        const hasDatabasePassword = rootScheme === "scrypt" && rootSalt && /^[a-f0-9]{128}$/i.test(rootHash || "");
        if (!hasDatabasePassword) {
          const currentRootPageAccess = rootAdmin.pageAccess || [];
          const rootPageAccess = adminPortalPages;
          if (
            currentRootPageAccess.length !== rootPageAccess.length ||
            rootPageAccess.some((page) => !currentRootPageAccess.includes(page))
          ) {
            rootAdmin.pageAccess = rootPageAccess;
            rootAdmin.authVersion = (Number(rootAdmin.authVersion) || 0) + 1;
            await rootAdmin.save();
          }

          return res.json({
            token: createAdminToken(email.toLowerCase(), secret, {
              role: rootAdmin.role,
              name: rootAdmin.name,
              pageAccess: rootPageAccess,
              userId: String(rootAdmin._id),
              authVersion: Number(rootAdmin.authVersion) || 0,
            }),
            user: {
              _id: rootAdmin._id,
              name: rootAdmin.name,
              email: rootAdmin.email,
              avatarUrl: rootAdmin.avatarUrl || "",
              role: rootAdmin.role,
              pageAccess: rootPageAccess,
            },
          });
        }
      }

      const staff = await User.findOne({
        email: parsed.data.email.toLowerCase(),
        role: { $in: ["admin", "employee"] },
      }).select("+passwordHash");
      if (!staff) {
        return res.status(401).json({
          error: "No admin or employee account is registered with this email address.",
        });
      }
      if (!staff.isActive) {
        return res.status(401).json({ error: "This admin account is disabled." });
      }

      const [scheme, salt, expectedHash] = (staff?.passwordHash || "").split("$");
      if (scheme !== "scrypt" || !salt || !/^[a-f0-9]{128}$/i.test(expectedHash || "")) {
        return res.status(500).json({
          error: "Password credentials for this account are not configured correctly. Ask an administrator to reset the account password.",
        });
      }
      let passwordMatches = false;

      const actualHash = crypto.scryptSync(parsed.data.password, salt, 64);
      const expected = Buffer.from(expectedHash, "hex");
      passwordMatches =
        expected.length === actualHash.length &&
        crypto.timingSafeEqual(expected, actualHash);

      if (!passwordMatches) {
        return res.status(401).json({ error: "The password is incorrect." });
      }

      const claims = {
        role: staff.role,
        pageAccess: staff.pageAccess || [],
        userId: String(staff._id),
        authVersion: Number(staff.authVersion) || 0,
        name: staff.name,
      };
      res.json({
        token: createAdminToken(staff.email, secret, claims),
        user: {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          avatarUrl: staff.avatarUrl || "",
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
      const staff = await User.findById(req.admin.userId)
        .select("name email avatarUrl role isActive pageAccess authVersion")
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
          avatarUrl: staff.avatarUrl || "",
          role: staff.role,
          pageAccess,
        },
      });
    }),
  );

  router.use(requireAdmin, requirePageAccess);
}

module.exports = registerAdminAuthRoutes;
