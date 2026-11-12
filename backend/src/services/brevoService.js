const config = require("../config");

/**
 * Brevo (Sendinblue) Transactional Email Service
 * Uses native fetch to call the Brevo v3 REST API (https://api.brevo.com/v3/smtp/email).
 */

/**
 * Send an email using Brevo's Transactional Email API.
 * In development or when BREVO_API_KEY is not set, falls back to logging the email to console.
 */
async function sendBrevoEmail({ toEmail, toName, subject, htmlContent, textContent, replyTo }) {
  const apiKey = (config.brevoApiKey || "").trim();
  const senderEmail = (config.brevoSenderEmail || "support@healthwithherbal.com").trim();
  const senderName = (config.brevoSenderName || "Health with Herbal").trim();

  // If no API key configured or placeholder, log to console in dev mode
  if (!apiKey || apiKey === "your_brevo_api_key_here") {
    console.log("\n======================================================================");
    console.log("🌿 [BREVO DEV / SIMULATION MODE] Transactional Email");
    console.log(`➡️  To: ${toName ? `${toName} <${toEmail}>` : toEmail}`);
    console.log(`📌  Subject: ${subject}`);
    console.log(`🏢  Sender: ${senderName} <${senderEmail}>`);
    if (textContent) {
      console.log(`📄  Message Preview:\n${textContent.trim()}`);
    }
    console.log("💡  Notice: Set BREVO_API_KEY in backend/.env to send real emails.");
    console.log("======================================================================\n");
    return { success: true, isDev: true, simulated: true };
  }

  try {
    const payload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: toEmail,
          name: toName || toEmail.split("@")[0],
        },
      ],
      subject,
      htmlContent,
    };

    if (replyTo?.email) {
      payload.replyTo = {
        email: replyTo.email,
        ...(replyTo.name ? { name: replyTo.name } : {}),
      };
    }

    if (textContent) {
      payload.textContent = textContent;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("❌ [Brevo API Error]", {
        status: response.status,
        statusText: response.statusText,
        data,
      });

      const errorMessage =
        data.message ||
        `Brevo API failed with status ${response.status} (${response.statusText})`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.brevoData = data;
      throw error;
    }

    console.log(
      `✅ [Brevo Success] Email sent to ${toEmail} (Message ID: ${data.messageId || "ok"})`,
    );
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("❌ Error sending email via Brevo:", error.message);
    throw error;
  }
}

/**
 * Generate a luxury Ayurvedic branded HTML template for OTP verification
 */
function buildOtpEmailTemplate({ name, otp, purpose }) {
  const greeting = name ? `Hello ${name},` : "Namaste,";
  const actionText =
    purpose === "signup"
      ? "to complete your registration and create your Health with Herbal account"
      : "to sign in to your Health with Herbal account";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Health with Herbal Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f4ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d3748; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f4ef; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(45, 30, 20, 0.08); border: 1px solid #ebdccb;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1c3629 0%, #2a4e3c 100%); padding: 36px 32px 30px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; width: 44px; height: 44px; background: rgba(255, 255, 255, 0.12); border-radius: 50%; line-height: 44px; font-size: 22px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
                🌿
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #ffffff; font-family: 'DM Sans', Georgia, serif;">
                Health with Herbal
              </h1>
              <p style="margin: 6px 0 0; font-size: 12px; color: #dfb76c; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;">
                Pure Ayurvedic Formulations
              </p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h2 style="margin: 0 0 14px; font-size: 20px; color: #1c3629; font-weight: 700;">
                Verification Code
              </h2>
              
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #4a5568;">
                ${greeting}
              </p>

              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a5568;">
                Please use the one-time verification code (OTP) below ${actionText}:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 26px 0 28px;">
                <tr>
                  <td align="center" style="background: #fbf7f0; border: 1.5px dashed #c59b4c; border-radius: 12px; padding: 22px 16px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1c3629; display: inline-block; padding-left: 10px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <div style="background-color: #fdfaf5; border-left: 3px solid #c59b4c; padding: 12px 14px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #74512d;">
                  ⏳ <strong>Valid for 10 minutes:</strong> This security code will expire in 10 minutes. For your safety, do not share this code with anyone.
                </p>
              </div>

              <p style="margin: 0 0 8px; font-size: 13.5px; line-height: 1.6; color: #718096;">
                If you did not request this verification code, you can safely ignore this email or reach out to our support team.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 36px;">
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px; text-align: center; background-color: #faf8f5;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #a0aec0;">
                Secured by Health with Herbal &bull; Authentic Ayurvedic Wellness
              </p>
              <p style="margin: 0; font-size: 11.5px; color: #cbd5e0;">
                &copy; ${new Date().getFullYear()} Health with Herbal. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate luxury Welcome HTML template for newly registered users
 */
function buildWelcomeEmailTemplate({ name }) {
  const customerName = name || "Valued Seeker";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Health with Herbal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f4ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d3748; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f4ef; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(45, 30, 20, 0.08); border: 1px solid #ebdccb;">
          
          <!-- Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1c3629 0%, #2a4e3c 100%); padding: 40px 32px; text-align: center; color: #ffffff;">
              <div style="font-size: 32px; margin-bottom: 8px;">🌿</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.04em; color: #ffffff;">
                Welcome to Health with Herbal
              </h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #dfb76c; letter-spacing: 0.1em; text-transform: uppercase;">
                Your Journey to Pure Ayurvedic Harmony Begins
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #1c3629; font-weight: 600;">
                Namaste, ${customerName}!
              </p>
              
              <p style="margin: 0 0 20px; font-size: 14.5px; line-height: 1.6; color: #4a5568;">
                We are thrilled to welcome you to our community. Your account is now verified and active. You can now effortlessly track your orders, save your wishlist rituals, and enjoy member-exclusive Ayurvedic formulation launches.
              </p>

              <!-- Value Props -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #fcf9f4; border-radius: 10px; margin-bottom: 10px;">
                    <div style="font-size: 14px; font-weight: 700; color: #1c3629; margin-bottom: 4px;">🌱 100% Authentic Herbals</div>
                    <div style="font-size: 12.5px; color: #64748b;">Cold-pressed, unadulterated botanical formulas crafted with time-tested Vedic texts.</div>
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #fcf9f4; border-radius: 10px;">
                    <div style="font-size: 14px; font-weight: 700; color: #1c3629; margin-bottom: 4px;">🧪 Certified Purity & Potency</div>
                    <div style="font-size: 12.5px; color: #64748b;">Third-party lab tested for heavy metals, pesticides, and microbial safety.</div>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin: 30px 0 10px;">
                <a href="${config.webOrigin}" style="display: inline-block; background-color: #1c3629; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.03em;">
                  Explore Ayurvedic Remedies &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px; text-align: center; background-color: #faf8f5; border-top: 1px solid #edf2f7;">
              <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                Health with Herbal &bull; Pure Wellness, Mindful Living
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send OTP Verification Email
 */
async function sendOtpEmail({ email, name, otp, purpose = "login" }) {
  const subject =
    purpose === "signup"
      ? `Verify your email for Health with Herbal: ${otp}`
      : `Your Health with Herbal Verification Code: ${otp}`;

  const textContent = `
Namaste${name ? ` ${name}` : ""},

Your Health with Herbal verification code is: ${otp}

This code is valid for 10 minutes.
Please do not share this one-time code with anyone.

Health with Herbal Team
  `.trim();

  const htmlContent = buildOtpEmailTemplate({ name, otp, purpose });

  return sendBrevoEmail({
    toEmail: email,
    toName: name,
    subject,
    htmlContent,
    textContent,
  });
}

/**
 * Send Welcome Email after successful account registration
 */
async function sendWelcomeEmail({ email, name }) {
  const subject = "Welcome to Health with Herbal 🌿";
  const textContent = `
Namaste${name ? ` ${name}` : ""},

Welcome to Health with Herbal! Your account has been verified and created successfully.

Explore our collection of authentic Ayurvedic formulas: ${config.webOrigin}

Warm regards,
The Health with Herbal Family
  `.trim();

  const htmlContent = buildWelcomeEmailTemplate({ name });

  return sendBrevoEmail({
    toEmail: email,
    toName: name,
    subject,
    htmlContent,
    textContent,
  });
}

module.exports = {
  sendBrevoEmail,
  sendOtpEmail,
  sendWelcomeEmail,
};
