const service = require("./analytics.service");

/**
 * GET /api/v1/analytics/engagement
 */
exports.getEngagementStats = async (req, res, next) => {
  try {
    const { startDate, endDate, limit } = req.query;

    const stats = await service.getProjectEngagementStats({
      startDate,
      endDate,
      limit: parseInt(limit, 10) || 20,
    });

    res.json({
      success: true,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        limit: parseInt(limit, 10) || 20,
      },
      data: stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/analytics/project/:projectId
 */
exports.getProjectEngagementCount = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const count = await service.getProjectEngagementCount(projectId);

    res.json({
      success: true,
      projectId,
      engagementCount: count,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};