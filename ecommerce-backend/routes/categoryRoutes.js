const express = require('express');
const { addCategory, getCategories } = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Admin route to add category (Protected by JWT authentication)
router.post('/category', authMiddleware, addCategory);

// Get all categories (For public users)
router.get('/categories', getCategories);

module.exports = router;
