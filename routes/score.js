const express = require('express');
const { getScores, getScore, getScoreByUserID, createScore, updateScore, deleteScore } = require('../controllers/score');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, authorize('user', 'S-admin', 'admin'), getScores)
    .post(protect, authorize('user', 'S-admin', 'admin'), createScore);
router.route('/user/:UserID')
    .get(protect, getScoreByUserID)
router.route('/:id')
    .get(protect, authorize('user', 'S-admin', 'admin'), getScore)
    .put(protect, authorize( 'S-admin' ), updateScore)
    .delete(protect, authorize('user', 'S-admin', 'admin'), deleteScore);

module.exports = router;