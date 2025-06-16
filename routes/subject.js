const express = require('express');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subject');
const { subjectUpload, handleUploadError } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all subjects | POST create new subject with image
router.route('/')
  .get(getSubjects)
  .post(
    protect,
    authorize('S-admin'),
    subjectUpload.single('image'),
    handleUploadError,
    createSubject
  );

// GET single subject | PUT update subject | DELETE subject
router.route('/:id')
  .get(getSubject)
  .put(
    protect,
    authorize('S-admin'),
    subjectUpload.single('image'),
    handleUploadError,
    updateSubject
  )
  .delete(protect, authorize('S-admin'), deleteSubject);

module.exports = router;
