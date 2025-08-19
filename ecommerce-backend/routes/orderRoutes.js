const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  placeOrder,
  getUserOrders,
  getUserOrderById,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats,
  getDuePayments
} = require('../controllers/orderController');

// User routes
router.post('/orders/place', authMiddleware, placeOrder);
router.get('/orders/my', authMiddleware, getUserOrders);
router.get('/orders/my/:orderId', authMiddleware, getUserOrderById);

// Admin routes
router.get('/orders/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.get('/orders/admin/stats', authMiddleware, adminMiddleware, getOrderStats);
router.get('/orders/admin/due-payments', authMiddleware, adminMiddleware, getDuePayments);
router.get('/orders/admin/:orderId', authMiddleware, adminMiddleware, getOrderById);
router.put('/orders/admin/:orderId/status', authMiddleware, adminMiddleware, updateOrderStatus);
router.put('/orders/admin/:orderId/payment', authMiddleware, adminMiddleware, updatePaymentStatus);


module.exports = router;