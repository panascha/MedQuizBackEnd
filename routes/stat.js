const express = require('express');
const router = express.Router();
const { getStatOverAll, getDailyActivity, getStatUser, getStatByUserId } = require('../controllers/stat');
const { protect, authorize } = require('../middleware/auth');

router.get('/overall', protect, authorize('admin', 'S-admin'), getStatOverAll);

router.post('/daily-activity', protect, authorize('admin', 'S-admin'), getDailyActivity);

router.get('/user-stats', protect, authorize('admin', 'S-admin', 'user'), getStatUser);

router.get('/user-stats/:userId', protect, authorize('admin', 'S-admin', 'user'), getStatByUserId);

module.exports = router;
