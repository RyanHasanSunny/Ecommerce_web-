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
const { 
  registerValidators, 
  loginValidators, 
  passwordUpdateValidators,
  handleValidationErrors 
} = require('../middleware/validationMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { msg: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: { msg: 'Too many registration attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes
router.post('/register', 
  registerLimiter,
  registerValidators, 
  handleValidationErrors,
  registerUser
);

router.post('/login', 
  authLimiter,
  loginValidators, 
  handleValidationErrors,
  loginUser
);

router.post('/forgot-password', 
  authLimiter,
  forgotPassword
);

router.post('/reset-password', 
  authLimiter,
  resetPassword
);

// Protected routes
router.post('/logout', 
  authMiddleware, 
  logoutUser
);

router.get('/profile', 
  authMiddleware, 
  getUserProfile
);

router.put('/password', 
  authMiddleware,
  passwordUpdateValidators,
  handleValidationErrors,
  updatePassword
);

module.exports = router;