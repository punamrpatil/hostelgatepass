const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUserNotifications,
  markNotificationsRead
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
module.exports = router;
