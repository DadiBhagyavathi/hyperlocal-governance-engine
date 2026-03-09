const express = require('express');
const router = express.Router();
const controller = require('./detection.controller');

router.post('/complaint', controller.reportComplaint);
router.get('/clusters', controller.getClusters);

module.exports = router;
