const rateLimitMap = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60;

module.exports = (req, res, next) => {
  const ip = req.ip;
  const currentTime = Date.now();

  const entry = rateLimitMap.get(ip) || {
    count: 0,
    startTime: currentTime,
  };

  if (currentTime - entry.startTime > WINDOW_MS) {
    entry.count = 1;
    entry.startTime = currentTime;
  } else {
    entry.count += 1;
  }

  rateLimitMap.set(ip, entry);

  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }

  next();
};