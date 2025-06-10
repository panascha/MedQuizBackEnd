const express = require('express');
const {
  getKeywords,
  getKeyword,
  getKeywordBySubject,
  createKeyword,
  updateKeyword,
  deleteKeyword
} = require('../controllers/keyword');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all keywords | POST create new keyword
router.route('/')
  .get(protect, authorize('user', 'S-admin', 'admin'), getKeywords)
  .post(
    protect,
    authorize('user', 'S-admin', 'admin'),
    createKeyword
  );

// GET keywords by subject
router.route('/subject/:subjectID')
  .get(protect, authorize('user', 'S-admin', 'admin'), getKeywordBySubject);

// GET by ID | PUT update | DELETE
router.route('/:id')
  .get(protect, authorize('user', 'S-admin', 'admin'), getKeyword)
  .put(
    protect,
    authorize('user', 'S-admin', 'admin'),
    updateKeyword
  )
  .delete(
    protect,
    authorize('S-admin'),
    deleteKeyword
  );

module.exports = router; 