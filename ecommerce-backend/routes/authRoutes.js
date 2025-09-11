const express = require('express');
const router  = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register',       registerUser);
router.post('/login',          loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

// Protected routes
router.post('/logout',          authMiddleware, logoutUser);
router.get('/profile',          authMiddleware, getUserProfile);
router.put('/password', authMiddleware, updatePassword);

module.exports = router;