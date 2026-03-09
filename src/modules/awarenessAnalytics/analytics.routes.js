const express = require('express');
const router = express.Router();
const controller = require('./analytics.controller');

router.get('/awareness', controller.getAwareness);
router.get('/project-performance', controller.getProjectPerformance);

module.exports = router;
