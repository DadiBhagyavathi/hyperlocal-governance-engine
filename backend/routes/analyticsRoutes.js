const express = require('express');
const router = express.Router();
const { getAnalytics, updateAnalytics } = require('../controllers/analyticsController');

router.get('/', getAnalytics);
router.put('/', updateAnalytics);

module.exports = router;
