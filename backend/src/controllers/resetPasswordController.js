const crypto = require("node:crypto");
const { hashPassword, safeEqual } = require("../utils/crypto");
const { ADMIN_ROLES } = require("../constants/roles");

const INVALID_LINK_MESSAGE = "This password reset link is invalid or has expired. Request a new link and try again.";

function createResetPasswordController({ User }) {
  return async function resetPasswordController(req, res) {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const token = String(req.body?.token || "").trim();
    const password = req.body?.password;

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ||
      !/^[a-f0-9]{64}$/i.test(token) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({ error: INVALID_LINK_MESSAGE });
    }

    try {
      const staff = await User.findOne({
        email,
        role: { $in: ADMIN_ROLES },
        isActive: true,
      }).select("+passwordResetTokenHash +passwordResetExpiresAt");

      const expectedHash = staff?.passwordResetTokenHash || "";
      const expiresAt = staff?.passwordResetExpiresAt;
      const receivedHash = crypto.createHash("sha256").update(token).digest();
      const expected = /^[a-f0-9]{64}$/i.test(expectedHash)
        ? Buffer.from(expectedHash, "hex")
        : Buffer.alloc(0);
      const tokenMatches = safeEqual(expected, receivedHash);

      if (!staff || !tokenMatches || !expiresAt || expiresAt <= new Date()) {
        return res.status(400).json({ error: INVALID_LINK_MESSAGE });
      }

      staff.passwordHash = hashPassword(password);
      staff.passwordResetTokenHash = "";
      staff.passwordResetExpiresAt = null;
      staff.authVersion = (Number(staff.authVersion) || 0) + 1;
      await staff.save();

      return res.json({ success: true, message: "Your password has been reset. You can now sign in." });
    } catch (error) {
      console.error("Admin password reset failed:", error.message);
      return res.status(500).json({ error: "Could not reset the password right now. Please request a new link and try again." });
    }
  };
}

module.exports = createResetPasswordController;
