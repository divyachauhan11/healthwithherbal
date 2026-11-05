const app = require("./app");
const config = require("./config");
const { connectDatabase } = require("./db");
const mongoose = require("mongoose");
const { syncAllProductRatings } = require("./utils/syncRatings");

async function start() {
  await connectDatabase();
  await syncAllProductRatings().catch((err) => console.error("Initial ratings sync failed:", err.message));
  const server = app.listen(config.port, () => console.log(`Healthwithherbal API listening on port ${config.port}`));

  const shutdown = async (signal) => {
    console.log(`${signal} received; closing API server`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error("Could not start the API:", error.message);
  process.exit(1);
});