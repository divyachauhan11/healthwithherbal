const crypto = require("node:crypto");
const User = require("../models/User");

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createAdminToken(email, secret, claims = {}) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      ...claims,
      exp: Date.now() + 8 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function requireAdmin(req, res, next) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return res
      .status(503)
      .json({ error: "Admin access is not configured on the server." });
  }
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res
      .status(401)
      .json({ error: "Sign in to access the admin portal." });
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) {
    return res
      .status(401)
      .json({ error: "Your admin session is invalid. Please sign in again." });
  }
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.email || session.exp < Date.now()) {
      return res
        .status(401)
        .json({ error: "Your admin session has expired. Please sign in again." });
    }
    if (!session.userId || !Number.isInteger(session.authVersion)) {
      return res.status(401).json({
        error: "Your admin session must be renewed. Please sign in again.",
      });
    }

    const admin = await User.findById(session.userId)
      .select("email role isActive authVersion pageAccess")
      .lean();
    if (
      !admin ||
      !admin.isActive ||
      !["admin", "employee"].includes(admin.role) ||
      admin.email.toLowerCase() !== String(session.email).toLowerCase() ||
      (Number(admin.authVersion) || 0) !== session.authVersion
    ) {
      return res.status(401).json({
        error: "Your admin account is no longer active or authorized. Please sign in again.",
      });
    }

    req.admin = {
      email: session.email,
      role: admin.role,
      pageAccess: admin.pageAccess || [],
      userId: String(admin._id),
    };
    next();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res
        .status(401)
        .json({ error: "Your admin session is invalid. Please sign in again." });
    }
    next(error);
  }
}

module.exports = { createAdminToken, requireAdmin, safeEqual };
