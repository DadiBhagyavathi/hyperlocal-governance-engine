const express = require('express');
const router = express.Router();
const { getAllComplaints, createComplaint, detectIssueClusters } = require('../controllers/complaintController');

router.get('/', getAllComplaints);
router.post('/', createComplaint);
router.get('/detected', detectIssueClusters);

module.exports = router;
