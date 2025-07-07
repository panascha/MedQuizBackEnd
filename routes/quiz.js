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

const router = express.Router();

// GET all quizzes | POST create new quiz
router.route('/')
    .get(protect, authorize('user', 'S-admin', 'admin'), getQuizzes)
    .post(
        protect,
        authorize('user', 'S-admin', 'admin'),
        createQuiz
    );

// GET filtered quizzes
router.get('/filter/:subjectID?/:categoryID?', protect, authorize('user', 'S-admin', 'admin'), getQuizzesByFilter);

// GET by ID | PUT update | DELETE
router.route('/:id')
    .get(protect, authorize('user', 'S-admin', 'admin'), getQuiz)
    .put(
        protect,
        authorize('user', 'S-admin', 'admin'),
        updateQuiz
    )
    .delete(protect, authorize('S-admin', 'admin'), deleteQuiz);

module.exports = router;
