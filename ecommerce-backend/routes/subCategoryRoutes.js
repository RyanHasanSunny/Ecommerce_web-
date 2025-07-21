const express = require('express');
const { addSubCategory, getSubCategories } = require('../controllers/subCategoryController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Admin route to add subcategory (Protected)
router.post('/subcategory', authMiddleware, addSubCategory);

// Get subcategories by category (Public)
router.get('/subcategories/:categoryId', getSubCategories);

module.exports = router;
