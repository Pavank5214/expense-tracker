const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalytics, getAllActivity } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/analytics', protect, getAnalytics);
router.get('/activity', protect, getAllActivity);

module.exports = router;
