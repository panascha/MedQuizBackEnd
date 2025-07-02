const express = require('express');
const router = express.Router();
const { getStatOverAll, getDailyActivity} = require('../controllers/stat');
const { protect, authorize } = require('../middleware/auth');

router.get('/overall', protect, authorize('admin', 'S-admin'), getStatOverAll);

router.post('/daily-activity', protect, authorize('admin', 'S-admin'), getDailyActivity);

module.exports = router;
