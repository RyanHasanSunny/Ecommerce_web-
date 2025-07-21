const express = require('express');
const { registerAdmin, loginAdmin } = require('../controllers/authController');
const router = express.Router();

// Register new admin
router.post('/register', registerAdmin);

// Login existing admin
router.post('/login', loginAdmin);

module.exports = router;
