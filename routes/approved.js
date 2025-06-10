const express = require('express');
const {
  getApproveds,
  getApproved,
  createApproved,
  updateApproved,
  deleteApproved,
  approvedQuiz,
  approvedKeyword,
  approvedReport,
} = require('../controllers/approved');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all approved | POST create new approved
router.route('/')
  .get(getApproveds)
  .post(
    protect,
    authorize('admin', 'S-admin'),
    createApproved
  );

// GET by ID | PUT update | DELETE
router.route('/:id')
  .get(getApproved)
  .put(
    protect,
    authorize('admin'),
    updateApproved
  )
  .delete(
    protect,
    authorize('admin'),
    deleteApproved
  );

// Special route for quiz approval
router.route('/quiz/:quizID')
  .post(
    protect,
    authorize('admin', 'S-admin'),
    approvedQuiz
  );
router.route('/report/:reportID')
  .post(
    protect,
    authorize('admin', 'S-admin'),
    approvedReport
  );
router.route('/keyword/:keywordID')
  .post(
    protect,
    authorize('admin', 'S-admin'),
    approvedKeyword
  );

module.exports = router; 