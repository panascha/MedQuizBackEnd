const express = require('express');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subject');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all subjects | POST create new subject
router.route('/')
  .get(getSubjects)
  .post(
    protect,
    authorize('S-admin'),
    createSubject
  );

// GET single subject | PUT update subject | DELETE subject
router.route('/:id')
  .get(getSubject)
  .put(
    protect,
    authorize('S-admin'),
    updateSubject
  )
  .delete(protect, authorize('S-admin'), deleteSubject);

module.exports = router;