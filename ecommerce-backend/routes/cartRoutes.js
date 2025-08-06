const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  addToCart, 
  getCart, 
  removeItem, 
  clearCart,
  updateCartItemQuantity  // NEW METHOD
} = require('../controllers/cartController');

// Add item to cart
router.post('/cart', authMiddleware, addToCart);

// Get current cart
router.get('/cart', authMiddleware, getCart);

// Update cart item quantity - NEW ROUTE
router.put('/cart/item/:itemId', authMiddleware, updateCartItemQuantity);

// Remove item from cart
router.delete('/cart/item/:itemId', authMiddleware, removeItem);

// Clear entire cart
router.delete('/cart/clear', authMiddleware, clearCart);

module.exports = router;