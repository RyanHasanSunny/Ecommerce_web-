const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// User: Place a new order
router.post('/orders', authMiddleware, placeOrder);

// User: Get their orders
router.get('/orders/my', authMiddleware, getUserOrders);

// Admin: Get all orders
router.get('/orders', authMiddleware, getAllOrders);

// Admin: Update order status
router.put('/orders/:orderId', authMiddleware, updateOrderStatus);

module.exports = router;
