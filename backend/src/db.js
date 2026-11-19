const mongoose = require("mongoose");
const config = require("./config");
const User = require("./models/User");

async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  // Build the role-scoped unique index before removing the legacy global email
  // index so each email remains protected from duplicates within a role.
  await User.createIndexes();
  const userIndexes = await User.collection.indexes();
  const globalUniqueEmailIndex = userIndexes.find((index) =>
    index.unique &&
    Object.keys(index.key || {}).length === 1 &&
    index.key.email === 1,
  );
  if (globalUniqueEmailIndex) {
    await User.collection.dropIndex(globalUniqueEmailIndex.name);
    console.log("Updated user email uniqueness to be role-scoped");
  }
  console.log("Connected to MongoDB");
}

module.exports = { connectDatabase };
