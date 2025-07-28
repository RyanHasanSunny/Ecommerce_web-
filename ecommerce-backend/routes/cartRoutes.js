const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addToCart, getCart, removeItem, clearCart } = require('../controllers/cartController');

router.post('/cart', authMiddleware, addToCart);
router.get('/cart', authMiddleware, getCart);
router.delete('/cart/item/:itemId', authMiddleware, removeItem);
router.delete('/cart/clear', authMiddleware, clearCart);

module.exports = router;
