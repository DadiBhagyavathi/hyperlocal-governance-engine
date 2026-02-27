const Engagement = require("./engagement.model");

/**
 * Records a citizen engagement event
 * Used by geo-fence service, analytics jobs, etc.
 */
exports.recordEngagement = async ({
  projectId,
  userLat,
  userLng,
  source = "GEOFENCE",
}) => {
  return Engagement.create({
    projectId,
    userLat,
    userLng,
    source,
    triggeredAt: new Date(),
  });
};

/**
 * Fetches engagement count for a specific project
 */
exports.getEngagementCountByProject = async (projectId) => {
  return Engagement.countDocuments({ projectId });
};

/**
 * Returns total engagements in a time range
 */
exports.getEngagementsInRange = async (startDate, endDate) => {
  return Engagement.find({
    triggeredAt: { $gte: startDate, $lte: endDate },
  });
};

/**
 * Aggregates engagement stats per project
 * Used by analytics dashboard
 */
exports.getAggregatedStats = async () => {
  return Engagement.aggregate([
    {
      $group: {
        _id: "$projectId",
        totalEngagements: { $sum: 1 },
        lastTriggeredAt: { $max: "$triggeredAt" },
      },
    },
    {
      $sort: { totalEngagements: -1 },
    },
  ]);
};