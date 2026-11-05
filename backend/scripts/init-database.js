const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

// Loading models registers their schemas and exact collection names with Mongoose.
const modelsDirectory = path.resolve(__dirname, "../src/models");
require("node:fs").readdirSync(modelsDirectory).filter((name) => name.endsWith(".js")).forEach((name) => require(path.join(modelsDirectory, name)));

async function initialize() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required in backend/.env");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  for (const model of Object.values(mongoose.models)) {
    try { await model.createCollection(); } catch (error) {
      if (error.code !== 48 && error.codeName !== "NamespaceExists") throw error;
    }
    await model.createIndexes();
  }
  console.log(`Initialized ${Object.keys(mongoose.models).length} MongoDB collections and indexes.`);
  await mongoose.disconnect();
}

initialize().catch(async (error) => {
  console.error("Database initialization failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
