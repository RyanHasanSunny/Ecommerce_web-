const express = require('express');
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getUserProducts,
  incrementSoldCount,
  incrementSearchCount
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Admin routes (Protected by JWT authentication)
router.post('/product', authMiddleware, addProduct);
router.put('/product/:productId', authMiddleware, updateProduct);
router.delete('/product/:productId', authMiddleware, deleteProduct);
router.put('/product/sold/:productId', authMiddleware, incrementSoldCount);
router.put('/product/search/:productId', authMiddleware, incrementSearchCount);

// Public routes
router.get('/products', getProducts);
router.get('/product/:productId', getProductById);

module.exports = router;