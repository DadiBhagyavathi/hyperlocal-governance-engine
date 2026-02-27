const express = require("express");
const router = express.Router();

const analyticsController = require("./analytics.controller");

/**
 * @route   GET /api/v1/analytics/engagement
 */
router.get("/engagement", analyticsController.getEngagementStats);

/**
 * @route   GET /api/v1/analytics/project/:projectId
 */
router.get(
  "/project/:projectId",
  analyticsController.getProjectEngagementCount
);

module.exports = router;