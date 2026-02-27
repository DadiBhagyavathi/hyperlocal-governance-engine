const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

/**
 * Connect to MongoDB with production-grade configuration
 */
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    const connectionOptions = {
      autoIndex: env.isDev, // Only build indexes in development
      maxPoolSize: 10, // Connection pool size
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000, // Fail fast if DB unavailable
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    };

    await mongoose.connect(env.mongoUri, connectionOptions);

    logger.info("MongoDB connected successfully", {
      environment: env.nodeEnv,
    });

    /* ===========================
       Connection Event Listeners
    =========================== */

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connection established");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB runtime error", {
        error: err.message,
      });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

  } catch (error) {
    logger.error("MongoDB initial connection failed", {
      error: error.message,
    });

    // Fail fast in production
    process.exit(1);
  }
};

/* ===========================
   Graceful Shutdown Handling
=========================== */

const gracefulShutdown = async (signal) => {
  try {
    await mongoose.connection.close();
    logger.warn(`MongoDB connection closed due to ${signal}`);
    process.exit(0);
  } catch (error) {
    logger.error("Error during MongoDB shutdown", {
      error: error.message,
    });
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

module.exports = connectDB;