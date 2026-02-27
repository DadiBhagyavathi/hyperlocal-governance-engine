const logger = require("../config/logger");
const { generateRequestId } = require("../utils/idGenerator");

module.exports = (req, res, next) => {
  const requestId = generateRequestId();
  req.requestId = requestId;

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP Request", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
    });
  });

  next();
};