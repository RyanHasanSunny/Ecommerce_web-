const express = require('express');
const router  = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login',    loginUser);
router.post('/address', authMiddleware, addAddress);
// Protected routes
router.get('/profile',          authMiddleware, getUserProfile);

router.put('/profile/password', authMiddleware, updatePassword);


module.exports = router;
