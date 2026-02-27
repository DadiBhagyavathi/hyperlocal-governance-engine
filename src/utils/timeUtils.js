/**
 * Returns current ISO timestamp
 */
const nowISO = () => new Date().toISOString();

/**
 * Returns start & end of today (UTC)
 */
const todayRange = () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Converts milliseconds to readable format
 */
const msToReadable = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

module.exports = {
  nowISO,
  todayRange,
  msToReadable,
};