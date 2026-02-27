const env = require("./env");

const formatMessage = (level, message, meta = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
};

const logger = {
  info: (msg, meta) => {
    if (env.isDev) {
      console.log(formatMessage("INFO", msg, meta));
    }
  },

  warn: (msg, meta) => {
    console.warn(formatMessage("WARN", msg, meta));
  },

  error: (msg, meta) => {
    console.error(formatMessage("ERROR", msg, meta));
  },
};

module.exports = logger;