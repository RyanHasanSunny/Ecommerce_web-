const express = require('express');
const router = express.Router();
const { 
  getAllPromoCodes, 
  getPromoCodeById, 
  createPromoCode, 
  updatePromoCode, 
  deletePromoCode, 
  togglePromoCode 
} = require('../controllers/promoController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get all promo codes (Admin only)
router.get('/', adminMiddleware, getAllPromoCodes);

// Get single promo code (Admin only)
router.get('/:id', adminMiddleware, getPromoCodeById);

// Create new promo code (Admin only)
router.post('/', adminMiddleware, createPromoCode);

// Update promo code (Admin only)
router.put('/:id', adminMiddleware, updatePromoCode);

// Delete promo code (Admin only)
router.delete('/:id', adminMiddleware, deletePromoCode);

// Toggle promo code enabled status (Admin only)
router.put('/:id/toggle', adminMiddleware, togglePromoCode);

module.exports = router;
