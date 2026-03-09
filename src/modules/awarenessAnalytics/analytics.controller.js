const service = require('./analytics.service');

exports.getAwareness = async (req, res, next) => {
  try {
    const metrics = await service.getAwarenessMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
};

exports.getProjectPerformance = async (req, res, next) => {
  try {
    const performance = await service.getProjectPerformance();
    res.json({ success: true, data: performance });
  } catch (err) {
    next(err);
  }
};
