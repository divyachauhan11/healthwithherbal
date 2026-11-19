const User = require("../models/User");
const config = require("../config");
const { signHmac, verifyHmac } = require("../utils/crypto");

function createUserToken(userId) {
  if (config.adminSessionSecret.length < 32) {
    throw new Error(
      "Set an ADMIN_SESSION_SECRET of at least 32 characters in the backend environment first.",
    );
  }
  const payload = Buffer.from(
    JSON.stringify({
      userId: String(userId),
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${signHmac(payload, config.adminSessionSecret)}`;
}

async function requireUserSession(req, res, next) {
  const key = config.adminSessionSecret;
  if (key.length < 32) {
    return res
      .status(503)
      .json({ error: "User sessions are not configured on the server." });
  }
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res
      .status(401)
      .json({ error: "Please sign in to access your wishlist." });
  }
  const [payload, signature] = token.split(".");
  if (
    !payload ||
    !signature ||
    !verifyHmac(payload, signature, key)
  ) {
    return res
      .status(401)
      .json({ error: "Your session is invalid. Please sign in again." });
  }
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!claims.userId || claims.exp < Date.now()) {
      return res
        .status(401)
        .json({ error: "Your session has expired. Please sign in again." });
    }
    const user = await User.findById(claims.userId).select("_id isActive");
    if (!user?.isActive) {
      return res
        .status(401)
        .json({ error: "Your account is unavailable. Please sign in again." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Your session is invalid. Please sign in again." });
  }
}

module.exports = { createUserToken, requireUserSession };
