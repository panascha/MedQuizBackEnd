const express = require('express');
const { register, login, logout, getMe, updateUser, getAllUser, checkUserExists, banUser, unbanUser, requestOTP, resetPasswordWithOTP} = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/request-reset-otp', protect, requestOTP);
router.post('/reset-password-otp', protect, resetPasswordWithOTP);
router.put("/updateUser/:id", protect, authorize("S-admin","admin", "user"), updateUser);
router.get('/users', protect, authorize('admin', 'S-admin'), getAllUser);
router.get('/user-exists', checkUserExists);
router.post('/ban/:id', protect, authorize('S-admin'), banUser);
router.post('/unban/:id', protect, authorize('S-admin'), unbanUser);

module.exports = router;