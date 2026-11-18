const express = require('express');
const { requireAuth } = require('../middleware/auth');
const reports = require('../controllers/reportController');

const router = express.Router();
router.use(requireAuth);

router.get('/daily', reports.daily);
router.get('/month-to-date', reports.monthToDate);
router.get('/monthly', reports.monthly);

module.exports = router;