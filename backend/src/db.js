const mongoose = require("mongoose");
const config = require("./config");

async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB");
}

module.exports = { connectDatabase };