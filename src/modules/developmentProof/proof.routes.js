const express = require('express');
const router = express.Router();
const controller = require('./proof.controller');

router.post('/upload', controller.uploadProof);
router.get('/all', controller.getAllProofs);
router.get('/:projectId', controller.getProof);

module.exports = router;
