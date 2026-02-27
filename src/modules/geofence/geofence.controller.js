const service = require("./geofence.service");

/**
 * POST /api/v1/geofence/validate
 */
exports.validateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    const results = await service.processLocation(
      latitude,
      longitude
    );

    res.json({
      success: true,
      insideGeoFence: results.length > 0,
      matches: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};