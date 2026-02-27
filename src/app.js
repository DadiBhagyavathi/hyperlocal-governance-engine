const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const logger = require("./config/logger");

const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/error.middleware");
const rateLimiter = require("./middleware/rateLimiter");

const routes = require("./routes");

const app = express();

/* ---------- Global Middlewares ---------- */
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(requestLogger);
app.use(rateLimiter);

/* ---------- Health Check ---------- */
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "Hyper-Local Targeting Engine",
    environment: env.nodeEnv,
    time: new Date().toISOString(),
  });
});

/* ---------- API Routes ---------- */
app.use("/api/v1", routes);

/* ---------- 404 Handler ---------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

/* ---------- Global Error Handler ---------- */
app.use(errorHandler);

/* ---------- Startup Log ---------- */
logger.info("Application initialized");

module.exports = app;