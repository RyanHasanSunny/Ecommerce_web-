const express = require('express');
const { addProduct, getProducts, incrementSoldCount, incrementSearchCount, getFeatureProducts } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Admin route to add product (Protected by JWT authentication)
router.post('/product', authMiddleware, addProduct);

// Get all products (For public users)
router.get('/products', getProducts);

// Increment sold count (For tracking sales)
router.put('/product/sold/:productId', authMiddleware, incrementSoldCount);

// Increment search count (For tracking searches)
router.put('/product/search/:productId', authMiddleware, incrementSearchCount);

// Get feature products (Top-selling and top-searched)
router.get('/feature-products', getFeatureProducts);

module.exports = router;
