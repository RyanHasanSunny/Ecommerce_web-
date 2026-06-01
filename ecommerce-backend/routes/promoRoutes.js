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
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get all promo codes (Admin only)
router.get('/', authMiddleware, adminMiddleware, getAllPromoCodes);

// Get single promo code (Admin only)
router.get('/:id', authMiddleware, adminMiddleware, getPromoCodeById);

// Create new promo code (Admin only)
router.post('/', authMiddleware, adminMiddleware, createPromoCode);

// Update promo code (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, updatePromoCode);

// Delete promo code (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deletePromoCode);

// Toggle promo code enabled status (Admin only)
router.put('/:id/toggle', authMiddleware, adminMiddleware, togglePromoCode);

module.exports = router;
