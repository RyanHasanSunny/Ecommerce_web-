const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

// Create order from cart
exports.placeOrder = async (req, res) => {
  const userId = req.user;
  const { shippingAddress, paymentMethod = 'cod' } = req.body;

  try {
    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    const newOrder = new Order({
      userId,
      items: cart.items,
      totalAmount: cart.totalAmount,
      shippingAddress,
      paymentMethod
    });

    await newOrder.save();

    cart.status = 'completed';
    await cart.save();

    res.status(201).json({ msg: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while placing order' });
  }
};

// Get all orders for current user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error while fetching orders' });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error while fetching all orders' });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.status = status;
    await order.save();

    res.json({ msg: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ msg: 'Server error while updating order status' });
  }
};
