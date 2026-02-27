const crypto = require("crypto");

/**
 * Generates a short unique ID
 */
const generateId = (length = 8) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generates request correlation ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${generateId(4)}`;
};

module.exports = {
  generateId,
  generateRequestId,
};