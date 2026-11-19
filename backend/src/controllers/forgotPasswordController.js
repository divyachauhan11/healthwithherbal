const crypto = require("node:crypto");
const config = require("../config");
const {
  sendBrevoEmail,
  buildPasswordResetEmailTemplate,
} = require("../services/brevoService");
const { ADMIN_ROLES } = require("../constants/roles");

const GENERIC_MESSAGE = "If an active admin account exists for that email, password reset instructions will be sent shortly.";

function createForgotPasswordController({ User }) {
  return async function forgotPasswordController(req, res) {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(200).json({ success: true, message: GENERIC_MESSAGE });
    }

    try {
      const user = await User.findOne({
        email,
        role: { $in: ADMIN_ROLES },
        isActive: true,
      });

      if (user) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        user.passwordResetTokenHash = tokenHash;
        user.passwordResetExpiresAt = expiresAt;
        await user.save();

        const resetUrl = new URL("/reset-password", config.webOrigin);
        resetUrl.searchParams.set("token", rawToken);
        resetUrl.searchParams.set("email", email);
        const subject = "Reset your Health with Herbal admin password";
        const textContent = `A password reset was requested for your admin account. Open this link within 30 minutes to continue: ${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`;
        const htmlContent = buildPasswordResetEmailTemplate({
          resetUrl: resetUrl.toString(),
        });

        await sendBrevoEmail({
          toEmail: email,
          toName: user.name,
          subject,
          textContent,
          htmlContent,
        });
      }

      return res.status(200).json({ success: true, message: GENERIC_MESSAGE });
    } catch (error) {
      console.error("Admin forgot-password request failed:", error.message);
      // Keep the same response for provider/database failures to avoid exposing account state.
      return res.status(200).json({ success: true, message: GENERIC_MESSAGE });
    }
  };
}

module.exports = createForgotPasswordController;
