const express = require('express');
const router = express.Router();
const { getStatOverAll } = require('../controllers/stat');
const { protect, authorize } = require('../middleware/auth');

// Get overall statistics
// Protected route - only accessible by admin users
router.get('/overall', protect, authorize('admin', 'sadmin'), getStatOverAll);

module.exports = router;
