const express = require("express");
const { z } = require("zod");
const { rateLimit } = require("express-rate-limit");
const config = require("../config");
const { sendBrevoEmail } = require("../services/brevoService");

const router = express.Router();
const contactLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many messages were sent. Please try again in a little while.",
  },
});

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  topic: z.enum([
    "Product question",
    "Order support",
    "Returns",
    "Something else",
  ]),
  message: z.string().trim().min(1).max(4000),
  website: z.string().max(500).optional(),
});

const htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => htmlEscapes[char]);

router.post("/", contactLimit, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please check your name, email, enquiry type, and message." });
  }

  const { name, email, topic, message, website } = parsed.data;
  // Quietly accept honeypot submissions without forwarding spam.
  if (website) return res.json({ success: true });

  if (!config.brevoApiKey || config.brevoApiKey === "your_brevo_api_key_here") {
    return res.status(503).json({
      error:
        "Online message sending is not configured yet. Please email healthwithherbalindia@gmail.com directly.",
    });
  }

  const subject = `Website enquiry: ${topic}`;
  const textContent = [
    "New website contact message",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Enquiry type: ${topic}`,
    "",
    "Message:",
    message,
  ].join("\n");
  const htmlContent = `
    <h2>New website contact message</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Enquiry type:</strong> ${escapeHtml(topic)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `;

  try {
    await sendBrevoEmail({
      toEmail: config.contactEmail,
      toName: "Healthwithherbal India",
      subject,
      htmlContent,
      textContent,
      replyTo: { email, name },
    });
    return res.json({
      success: true,
      message: "Your message has been sent. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form email failed:", error.message);
    return res.status(502).json({
      error: "We could not send your message right now. Please email healthwithherbalindia@gmail.com directly.",
    });
  }
});

module.exports = router;
