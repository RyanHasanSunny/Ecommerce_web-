const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserAddresses, addAddress } = require('../controllers/authController');
const { getUserProducts } = require('../controllers/productController');

// User routes
router.get('/addresses', authMiddleware, getUserAddresses);
router.post('/address', authMiddleware, addAddress);
router.get('/products', authMiddleware, getUserProducts);

module.exports = router;