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

// New Feature Routes
router.use("/development-proof", require("./modules/developmentProof/proof.routes"));
router.use("/awareness", require("./modules/awarenessAnalytics/analytics.routes"));
router.use("/issue-detection", require("./modules/issueDetection/detection.routes"));

// ML Service Routes (proxy to FastAPI)
router.use("/ml", require("./modules/ml/ml.routes"));

module.exports = router;