const Engagement = require("../engagement/engagement.model");

/**
 * Get aggregated engagement stats per project
 * Supports optional date filtering
 */
exports.getProjectEngagementStats = async ({
  startDate,
  endDate,
  limit = 20,
}) => {
  const matchStage = {};

  // Optional date filtering
  if (startDate || endDate) {
    matchStage.triggeredAt = {};

    if (startDate) {
      matchStage.triggeredAt.$gte = new Date(startDate);
    }

    if (endDate) {
      matchStage.triggeredAt.$lte = new Date(endDate);
    }
  }

  const pipeline = [
    { $match: matchStage },

    {
      $group: {
        _id: "$projectId",
        totalEngagements: { $sum: 1 },
        lastTriggeredAt: { $max: "$triggeredAt" },
      },
    },

    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project",
      },
    },

    { $unwind: "$project" },

    // Filter soft-deleted projects
    {
      $match: {
        "project.isActive": true,
      },
    },

    {
      $project: {
        _id: 0,
        projectId: "$project._id",
        projectTitle: "$project.title",
        department: "$project.department",
        totalEngagements: 1,
        lastTriggeredAt: 1,
      },
    },

    { $sort: { totalEngagements: -1 } },

    { $limit: Math.min(limit, 100) },
  ];

  return Engagement.aggregate(pipeline);
};