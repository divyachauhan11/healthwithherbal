const crypto = require("node:crypto");

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

function requireAdmin(req, res, next) {
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
    req.admin = {
      email: session.email,
      role: session.role || "admin",
      pageAccess: Array.isArray(session.pageAccess) ? session.pageAccess : null,
      userId: session.userId || null,
    };
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Your admin session is invalid. Please sign in again." });
  }
}

module.exports = { createAdminToken, requireAdmin, safeEqual };
