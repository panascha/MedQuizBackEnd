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
const upload = require('../middleware/upload');

const router = express.Router();

// GET all quizzes | POST create new quiz with multiple images
router.route('/')
    .get(getQuizzes)
    .post(
        protect,
        upload.array('images', 5), // Allow up to 5 images
        createQuiz
    );

// GET filtered quizzes
router.get('/filter/:subjectID?/:categoryID?', protect, getQuizzesByFilter);

// GET by ID | PUT update with multiple images | DELETE
router.route('/:id')
    .get(getQuiz)
    .put(
        protect,
        upload.array('images', 3), // Allow up to 5 images
        updateQuiz
    )
    .delete(protect, authorize("S-admin", "admin"), deleteQuiz);

module.exports = router;
