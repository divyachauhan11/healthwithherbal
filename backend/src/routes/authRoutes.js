const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const Otp = require("../models/Otp");
const config = require("../config");
const { fetchExternal, readJsonResponse } = require("../utils/http");
const brevoService = require("../services/brevoService");
const { createUserToken } = require("../middleware/userSession");
const { USER_ROLES } = require("../constants/roles");
const { normalizePhone } = require("../utils/string");

const router = express.Router();

function maskEmail(email) {
  if (!email || !email.includes("@")) return email || "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local.charAt(0)}***@${domain}`;
  }
  return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

// -----------------------------------------------------------------------------
// 1. LOGIN: Request OTP (Sends OTP to user's verified email via Brevo)
// STRICT RULE: Do not allow login / OTP if user is not in database!
// -----------------------------------------------------------------------------
router.post("/login/request-otp", async (req, res) => {
  try {
    const { identifier, phone, email } = req.body;
    const rawInput = (identifier || email || phone || "").trim();

    if (!rawInput) {
      return res.status(400).json({
        error: "Please enter your registered email address or mobile number.",
      });
    }

    let user = null;
    const isEmailInput = rawInput.includes("@");

    if (isEmailInput) {
      const cleanEmail = rawInput.toLowerCase();
      user = await User.findOne({ email: cleanEmail, role: USER_ROLES.CUSTOMER });
      if (!user) {
        return res.status(404).json({
          notRegistered: true,
          error:
            "No account found with this email address. Please create an account first.",
        });
      }
    } else {
      const cleanPhone = normalizePhone(rawInput);
      if (!cleanPhone || cleanPhone.length !== 10) {
        return res.status(400).json({
          error: "Please enter a valid 10-digit mobile number or email address.",
        });
      }

      user = await User.findOne({
        $or: [
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { phone: new RegExp(`${cleanPhone}$`) },
        ],
      });

      if (!user) {
        return res.status(404).json({
          notRegistered: true,
          error:
            "No account found with this mobile number. Please create an account first.",
        });
      }
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "Your account has been deactivated. Please contact customer support.",
      });
    }

    if (!user.email) {
      return res.status(400).json({
        error: "No email address linked to this account for OTP verification.",
      });
    }

    // Generate cryptographically secure 6-digit OTP
    const otpCode = generateOtp();
    const expiryMinutes = 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Delete any pending login OTPs for this email to avoid duplicates
    await Otp.deleteMany({ email: user.email.toLowerCase(), purpose: "login" });

    // Store in MongoDB Otp collection with TTL auto-expiration
    await Otp.create({
      email: user.email.toLowerCase(),
      phone: user.phone || "",
      otp: otpCode,
      purpose: "login",
      expiresAt,
    });

    // Send OTP verification email via Brevo
    await brevoService.sendOtpEmail({
      email: user.email,
      name: user.name,
      otp: otpCode,
      purpose: "login",
    });

    const masked = maskEmail(user.email);
    const isSimulated = !config.brevoApiKey || config.brevoApiKey === "your_brevo_api_key_here";

    return res.json({
      success: true,
      message: `OTP sent successfully to registered email (${masked}).`,
      email: user.email,
      maskedEmail: masked,
      phone: user.phone || "",
      devOtp: isSimulated ? otpCode : undefined,
    });
  } catch (error) {
    console.error("Error in login request-otp:", error);
    return res.status(500).json({
      error:
        error.message || "Internal server error while processing login request.",
    });
  }
});

// -----------------------------------------------------------------------------
// 2. LOGIN: Verify OTP
// -----------------------------------------------------------------------------
router.post("/login/verify-otp", async (req, res) => {
  try {
    const { identifier, phone, email, otp } = req.body;
    const rawInput = (identifier || email || phone || "").trim();
    const otpStr = String(otp || "").trim();

    if (!rawInput) {
      return res.status(400).json({
        error: "Mobile number or email address is required.",
      });
    }

    if (!otpStr || (otpStr.length !== 6 && otpStr.length !== 4)) {
      return res.status(400).json({
        error: "Please enter a valid 6-digit verification code.",
      });
    }

    let user = null;
    if (rawInput.includes("@")) {
      user = await User.findOne({ email: rawInput.toLowerCase(), role: USER_ROLES.CUSTOMER });
    } else {
      const cleanPhone = normalizePhone(rawInput);
      user = await User.findOne({
        $or: [
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { phone: new RegExp(`${cleanPhone}$`) },
        ],
      });
    }

    if (!user) {
      return res.status(404).json({
        notRegistered: true,
        error: "No account found in database. Please sign up.",
      });
    }

    // Look for active OTP in MongoDB
    const otpRecord = await Otp.findOne({
      email: user.email.toLowerCase(),
      purpose: "login",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        error:
          "Verification code has expired or was not requested. Please request a new OTP.",
      });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        error: "Too many incorrect attempts. Please request a new code.",
      });
    }

    if (otpRecord.otp !== otpStr) {
      await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      const remainingAttempts = 5 - (otpRecord.attempts + 1);
      return res.status(400).json({
        error: `Incorrect verification code.${remainingAttempts > 0 ? ` (${remainingAttempts} attempts remaining)` : " Please request a new code."}`,
      });
    }

    // OTP verified successfully -> Delete OTP from DB
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.json({
      success: true,
      token: createUserToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error in login verify-otp:", error);
    return res.status(500).json({
      error: "Internal server error while verifying login OTP.",
    });
  }
});

// -----------------------------------------------------------------------------
// 3. SIGNUP: Request OTP (Checks uniqueness, creates OTP & sends via Brevo)
// -----------------------------------------------------------------------------
router.post("/signup/request-otp", async (req, res) => {
  try {
    const { name, email, phone: rawPhone } = req.body;
    const cleanPhone = normalizePhone(rawPhone);
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "").trim();

    if (!cleanName) {
      return res.status(400).json({ error: "Please enter your full name." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        error: "Please enter a valid 10-digit mobile number.",
      });
    }

    // Check if an account already exists in MongoDB with this phone or email
    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail, role: USER_ROLES.CUSTOMER },
        { phone: cleanPhone },
        { phone: `+91${cleanPhone}` },
        { phone: new RegExp(`${cleanPhone}$`) },
      ],
    });

    if (existingUser) {
      const matchField =
        existingUser.email === cleanEmail ? "email" : "mobile number";
      return res.status(409).json({
        error: `An account with this ${matchField} already exists. Please log in instead.`,
      });
    }

    // Generate 6-digit OTP
    const otpCode = generateOtp();
    const expiryMinutes = 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Remove any previous signup OTPs for this email
    await Otp.deleteMany({ email: cleanEmail, purpose: "signup" });

    // Store in Otp collection
    await Otp.create({
      email: cleanEmail,
      phone: cleanPhone,
      otp: otpCode,
      purpose: "signup",
      expiresAt,
    });

    // Send via Brevo
    await brevoService.sendOtpEmail({
      email: cleanEmail,
      name: cleanName,
      otp: otpCode,
      purpose: "signup",
    });

    const masked = maskEmail(cleanEmail);
    const isSimulated = !config.brevoApiKey || config.brevoApiKey === "your_brevo_api_key_here";

    return res.json({
      success: true,
      message: `Verification code sent to ${masked}. Please check your inbox.`,
      email: cleanEmail,
      maskedEmail: masked,
      devOtp: isSimulated ? otpCode : undefined,
    });
  } catch (error) {
    console.error("Error in signup request-otp:", error);
    return res.status(500).json({
      error:
        error.message || "Internal server error while preparing registration.",
    });
  }
});

// -----------------------------------------------------------------------------
// 4. SIGNUP: Verify OTP and CREATE USER IN MONGODB DATABASE
// -----------------------------------------------------------------------------
router.post("/signup/verify-otp", async (req, res) => {
  try {
    const { name, email, phone: rawPhone, otp } = req.body;
    const cleanPhone = normalizePhone(rawPhone);
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "").trim();
    const otpStr = String(otp || "").trim();

    if (!cleanName || !cleanEmail || !cleanPhone) {
      return res.status(400).json({
        error: "Name, email, and 10-digit phone number are required.",
      });
    }

    if (!otpStr || (otpStr.length !== 6 && otpStr.length !== 4)) {
      return res.status(400).json({
        error: "Please enter a valid 6-digit verification code.",
      });
    }

    // Find active OTP record
    const otpRecord = await Otp.findOne({
      email: cleanEmail,
      purpose: "signup",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        error:
          "Verification code has expired or was not requested. Please request a new code.",
      });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        error: "Too many incorrect attempts. Please request a new code.",
      });
    }

    if (otpRecord.otp !== otpStr) {
      await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      const remainingAttempts = 5 - (otpRecord.attempts + 1);
      return res.status(400).json({
        error: `Invalid verification code.${remainingAttempts > 0 ? ` (${remainingAttempts} attempts remaining)` : " Please request a new code."}`,
      });
    }

    // Ensure email or phone was not created in the meantime
    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail, role: USER_ROLES.CUSTOMER },
        { phone: cleanPhone },
        { phone: `+91${cleanPhone}` },
        { phone: new RegExp(`${cleanPhone}$`) },
      ],
    });

    if (existingUser) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(409).json({
        error:
          "An account with this email or mobile number already exists. Please log in.",
      });
    }

    // CREATE AND STORE USER IN DATABASE
    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: USER_ROLES.CUSTOMER,
      isActive: true,
      passwordHash: crypto.randomBytes(32).toString("hex"),
    });

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Send Welcome Email in background via Brevo (non-blocking)
    brevoService
      .sendWelcomeEmail({ email: cleanEmail, name: cleanName })
      .catch((err) => {
        console.error("Failed to send welcome email:", err.message);
      });

    return res.status(201).json({
      success: true,
      message: "Account created successfully in database!",
      token: createUserToken(newUser._id),
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
      },
    });
  } catch (error) {
    console.error("Error in signup verify-otp:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        error:
          "An account with this email address already exists. Please log in.",
      });
    }
    return res.status(500).json({
      error: "Internal server error while creating user account.",
    });
  }
});

// -----------------------------------------------------------------------------
// 5. SOCIAL AUTH (Google / Apple)
// -----------------------------------------------------------------------------
router.post("/social", async (req, res) => {
  try {
    const { provider, idToken } = req.body;
    if (provider !== "google" || !idToken || !config.googleClientId) {
      return res.status(400).json({ error: "Google sign-in is not configured or the credential is missing." });
    }

    const tokenResponse = await fetchExternal(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      {},
      { serviceName: "Google token verification", timeoutMs: 10000 },
    );
    if (!tokenResponse.ok) return res.status(401).json({ error: "Google credential is invalid or expired. Please try again." });
    const claims = await readJsonResponse(tokenResponse, "Google token verification");
    if (claims.aud !== config.googleClientId || claims.iss !== "https://accounts.google.com" || claims.email_verified !== "true" || !claims.email) {
      return res.status(401).json({ error: "Google account could not be verified." });
    }

    const cleanEmail = claims.email.toLowerCase();
    const cleanName = (claims.name || claims.given_name || "Google Customer").trim();

    let user = await User.findOne({ email: cleanEmail, role: USER_ROLES.CUSTOMER });

    if (user && !user.isActive) {
      return res.status(403).json({ error: "This account is unavailable. Please contact support." });
    }

    if (!user) {
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        role: USER_ROLES.CUSTOMER,
        isActive: true,
        passwordHash: crypto.randomBytes(32).toString("hex"),
      });

      // Send welcome email to new social signups
      if (email && email.includes("@")) {
        brevoService
          .sendWelcomeEmail({ email: cleanEmail, name: cleanName })
          .catch((err) => console.error("Welcome email error:", err.message));
      }
    }

    return res.json({
      success: true,
      token: createUserToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in social login:", error);
    return res.status(500).json({
      error: "Social sign-in failed. Please try again.",
    });
  }
});

module.exports = router;
