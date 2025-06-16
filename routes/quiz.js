const express = require('express');
const {
    getQuizzes,
    getQuizzesByFilter,
    getQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz
} = require('../controllers/quiz');
const { protect, authorize } = require('../middleware/auth');
const { quizUpload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// GET all quizzes | POST create new quiz with multiple images
router.route('/')
    .get(protect, authorize('user', 'S-admin', 'admin'), getQuizzes)
    .post(
        protect,
        authorize('user', 'S-admin', 'admin'),
        quizUpload.array('images', 5), // Allow up to 5 images
        handleUploadError,
        createQuiz
    );

// GET filtered quizzes
router.get('/filter/:subjectID?/:categoryID?', protect, authorize('user', 'S-admin', 'admin'), getQuizzesByFilter);

// GET by ID | PUT update with multiple images | DELETE
router.route('/:id')
    .get(protect, authorize('user', 'S-admin', 'admin'), getQuiz)
    .put(
        protect,
        authorize('user', 'S-admin', 'admin'),
        quizUpload.array('images', 5), // Allow up to 5 images
        handleUploadError,
        updateQuiz
    )
    .delete(protect, authorize('S-admin', 'admin'), deleteQuiz);

module.exports = router;
