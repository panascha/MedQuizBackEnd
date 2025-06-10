const express = require('express');
const {
  getReports,
  getReport,
  getReportByUserID,
  getReportByType,
  createReport,
  updateReport,
  deleteReport
} = require('../controllers/report');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all reports | POST create new report
router.route('/')
  .get(protect, authorize('user', 'S-admin', 'admin'), getReports)
  .post(protect, authorize('user', 'S-admin', 'admin'), createReport);

// GET reports by type
router.route('/type/:type')
  .get(protect, authorize('user', 'S-admin', 'admin'), getReportByType);

// GET reports by user ID
router.route('/user/:UserID')
  .get(protect, authorize('user', 'S-admin', 'admin'), getReportByUserID);

// GET by ID | PUT update | DELETE
router.route('/:id')
  .get(protect, authorize('user', 'S-admin', 'admin'), getReport)
  .put(protect, authorize('S-admin'), updateReport)
  .delete(protect, authorize('S-admin'), deleteReport);

module.exports = router;
