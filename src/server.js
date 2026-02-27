const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");
const logger = require("./config/logger");

/* ===========================
   Process-Level Error Handling
=========================== */
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason,
  });
  process.exit(1);
});

/* ===========================
   Bootstrap Server
=========================== */
const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Create HTTP Server
    const server = http.createServer(app);

    // Start Listening
    server.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
      logger.info("Server started successfully", {
        port: env.port,
        environment: env.nodeEnv,
      });
    });

    /* ===========================
       Graceful Shutdown
    =========================== */
    const shutdown = (signal) => {
      logger.warn(`Received ${signal}. Shutting down gracefully.`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    logger.error("Server startup failed", {
      error: error.message,
    });
    process.exit(1);
  }
};

startServer();