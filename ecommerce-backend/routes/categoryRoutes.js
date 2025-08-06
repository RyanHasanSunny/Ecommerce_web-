const express = require('express');
const router = express.Router();
const {
  addCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy,
  getCategoryStats
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
// @route   GET /api/categories
// @desc    Get all categories with optional filtering
// @query   includeChildren=true/false, parentOnly=true/false
router.get('/categories', getCategories);

// @route   GET /api/category/:id
// @desc    Get single category by ID
router.get('/category/:id', getCategoryById);

// @route   GET /api/categories/hierarchy
// @desc    Get categories in hierarchical structure (parents with their children)
router.get('/categories/hierarchy', getCategoryHierarchy);

// Protected routes (Admin only)
// @route   POST /api/category
// @desc    Create new category (parent or child)
// @body    { name, description, isParent, parentCategory? }
router.post('/category', authMiddleware, adminMiddleware, addCategory);

// @route   PUT /api/category/:id
// @desc    Update existing category
// @body    { name, description, isParent, parentCategory? }
router.put('/category/:id', authMiddleware, adminMiddleware, updateCategory);

// @route   DELETE /api/category/:id
// @desc    Delete category (with validation for children and products)
router.delete('/category/:id', authMiddleware, adminMiddleware, deleteCategory);

// @route   GET /api/categories/stats
// @desc    Get category statistics (Admin dashboard)
router.get('/categories/stats', authMiddleware, adminMiddleware, getCategoryStats);

module.exports = router;