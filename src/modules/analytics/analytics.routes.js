const express    = require("express");
const router     = express.Router();
const ctrl       = require("./analytics.controller");
const dashCtrl   = require("./dashboard.controller");

// existing routes
router.get("/engagement",           ctrl.getEngagementStats);
router.get("/project/:projectId",   ctrl.getProjectEngagementCount);

// NEW — live dashboard stats from PostgreSQL
router.get("/dashboard",            dashCtrl.getDashboard);
router.get("/ml-metrics",           dashCtrl.getMlMetrics);

module.exports = router;
