const express = require('express');
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport
} = require('../controllers/report');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all reports | POST create new report
router.route('/')
  .get(protect, getReports)
  .post(protect, createReport);

// GET by ID | PUT update | DELETE
router.route('/:id')
  .get(protect, getReport)
  .put(protect, authorize('S-admin'), updateReport)
  .delete(protect, authorize('S-admin'), deleteReport);

module.exports = router;
