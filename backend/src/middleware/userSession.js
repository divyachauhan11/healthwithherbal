const crypto = require("node:crypto");
const User = require("../models/User");

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function createUserToken(userId) {
  if (secret().length < 32) {
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
  return `${payload}.${sign(payload)}`;
}

async function requireUserSession(req, res, next) {
  const key = secret();
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
  const expected = payload ? sign(payload) : "";
  const suppliedBuffer = Buffer.from(signature || "");
  const expectedBuffer = Buffer.from(expected);
  if (
    !payload ||
    !signature ||
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
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
