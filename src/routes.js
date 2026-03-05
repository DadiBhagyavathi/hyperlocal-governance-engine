const express = require("express");
const router = express.Router();

/**
 * Module Routes
 */

router.use("/projects", require("./modules/project/project.routes"));
router.use("/geofence", require("./modules/geofence/geofence.routes"));
router.use("/analytics", require("./modules/analytics/analytics.routes"));
router.use("/auth", require("./modules/auth/auth.routes"));
router.use("/feedback", require("./modules/feedback/feedback.routes"));

module.exports = router;