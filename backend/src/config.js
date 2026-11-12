const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
  brevoApiKey: process.env.BREVO_API_KEY || "",
  brevoSenderEmail:
    process.env.BREVO_SENDER_EMAIL || "support@healthwithherbal.com",
  brevoSenderName: process.env.BREVO_SENDER_NAME || "Health with Herbal",
  contactEmail: process.env.CONTACT_EMAIL || "healthwithherbalindia@gmail.com",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || "healthwithherbal",
};

config.webOrigins = [
  ...new Set([
    ...config.webOrigin.split(",").map((origin) => origin.trim()),
    ...(config.nodeEnv === "production"
      ? []
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:3001",
        ]),
  ]),
];

if (!config.mongoUri) {
  throw new Error(
    "MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.",
  );
}

module.exports = config;
