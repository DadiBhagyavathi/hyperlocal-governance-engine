const engagementService = require("./engagement.service");

/**
 * GET /api/v1/engagement/stats
 * Returns aggregated engagement analytics
 */
exports.getEngagementStats = async (req, res, next) => {
  try {
    const stats = await engagementService.getAggregatedStats();

    res.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/engagement/project/:projectId/count
 * Returns engagement count for a project
 */
exports.getProjectEngagementCount = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const count =
      await engagementService.getEngagementCountByProject(projectId);

    res.json({
      success: true,
      projectId,
      engagementCount: count,
    });
  } catch (error) {
    next(error);
  }
};