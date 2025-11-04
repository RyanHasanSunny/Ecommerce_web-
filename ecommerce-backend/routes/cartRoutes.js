const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  addToCart,
  getCart,
  removeItem,
  clearCart,
  updateCartItemQuantity,  // NEW METHOD
  applyPromo,
  removePromo,
  // Guest cart methods
  addToGuestCart,
  getGuestCart,
  updateGuestCartItemQuantity,
  removeGuestItem,
  clearGuestCart,
  applyGuestPromo,
  removeGuestPromo
} = require('../controllers/cartController');

// Authenticated user routes
router.post('/cart', authMiddleware, addToCart);
router.get('/cart', authMiddleware, getCart);
router.put('/cart/item/:itemId', authMiddleware, updateCartItemQuantity);
router.delete('/cart/item/:itemId', authMiddleware, removeItem);
router.delete('/cart/clear', authMiddleware, clearCart);
router.post('/cart/apply-promo', authMiddleware, applyPromo);
router.delete('/cart/remove-promo', authMiddleware, removePromo);

// Guest cart routes (no authentication required)
router.post('/guest/cart', addToGuestCart);
router.get('/guest/cart', getGuestCart);
router.put('/guest/cart/item/:itemId', updateGuestCartItemQuantity);
router.delete('/guest/cart/item/:itemId', removeGuestItem);
router.delete('/guest/cart/clear', clearGuestCart);
router.post('/guest/cart/apply-promo', applyGuestPromo);
router.delete('/guest/cart/remove-promo', removeGuestPromo);

module.exports = router;
