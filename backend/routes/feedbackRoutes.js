const express = require('express');
const router = express.Router();
const { getAllFeedback, createFeedback } = require('../controllers/feedbackController');

router.get('/', getAllFeedback);
router.post('/', createFeedback);

module.exports = router;
