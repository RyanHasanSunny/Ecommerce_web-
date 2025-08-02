const express = require('express');
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  incrementSoldCount,
  incrementSearchCount,
  deleteProduct,
  getProductsByCategory,
  getTopSellingProducts,
  getMostSearchedProducts,
  getProductCount,
  getProductCountByCategory
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Admin routes (Protected by JWT authentication)
router.post('/product', authMiddleware, addProduct);
router.put('/product/:productId', authMiddleware, updateProduct);
router.put('/product/sold/:productId', authMiddleware, incrementSoldCount);
router.put('/product/search/:productId', authMiddleware, incrementSearchCount);
router.delete('/product/:productId', authMiddleware, deleteProduct);

// Public routes
router.get('/products', getProducts);
router.get('/product/:productId', getProductById);
router.get('/products/category/:categoryId', getProductsByCategory);
router.get('/products/top-selling', getTopSellingProducts);
router.get('/products/most-searched', getMostSearchedProducts);
router.get('/products/count', getProductCount);
router.get('/products/count-by-category', getProductCountByCategory);

module.exports = router;