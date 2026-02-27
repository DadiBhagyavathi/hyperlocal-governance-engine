const Engagement = require("../modules/engagement/engagement.model");
const logger = require("../config/logger");

/**
 * Generates daily engagement snapshot
 * Designed to be triggered by cron scheduler
 */
exports.generateDailyStats = async () => {
  try {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    const totalToday = await Engagement.countDocuments({
      triggeredAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    const result = {
      date: startOfToday.toISOString().split("T")[0],
      totalEngagements: totalToday,
      generatedAt: new Date().toISOString(),
    };

    logger.info("Daily engagement snapshot generated", result);

    return result;
  } catch (error) {
    logger.error("Failed to generate daily analytics snapshot", {
      error: error.message,
    });

    throw error;
  }
};