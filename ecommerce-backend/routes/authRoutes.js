const express = require('express');
const router  = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updatePassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login',    loginUser);

// Protected routes
router.get('/profile',          authMiddleware, getUserProfile);
router.put('/password', authMiddleware, updatePassword);

module.exports = router;