const express = require("express");
const router = express.Router();

/**
 * Module Routes
 */

router.use("/projects", require("./modules/project/project.routes"));
router.use("/geofence", require("./modules/geofence/geofence.routes"));
router.use("/analytics", require("./modules/analytics/analytics.routes"));

module.exports = router;