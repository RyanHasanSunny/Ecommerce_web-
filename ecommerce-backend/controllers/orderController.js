const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// Calculate delivery charge based on location or order value
const calculateDeliveryCharge = (city, subtotal) => {
  // Inside Dhaka
  if (city && city.toLowerCase().includes('dhaka')) {
    return 60;
  }
  // Outside Dhaka
  return 120;
  
  // You can also add free delivery for orders above certain amount
  // if (subtotal > 5000) return 0;
};

const calculateOrderRevenue = (order) => {
  let sellingPriceTotal = 0;
  let offerPriceTotal = 0;
  let profitTotal = 0;

  order.items.forEach(item => {
    // Calculate based on actual product data if available
    if (item.productId) {
      const quantity = item.quantity;
      
      // Selling price total (original selling price × quantity)
      sellingPriceTotal += (item.productId.sellingPrice || item.price) * quantity;
      
      // Offer price total (if offer price exists)
      if (item.productId.offerPrice) {
        offerPriceTotal += item.productId.offerPrice * quantity;
      }
      
      // Profit calculation (selling price - cost price) × quantity
      if (item.productId.profit) {
        profitTotal += item.productId.profit * quantity;
      }
    } else {
      // Fallback to stored item data
      sellingPriceTotal += (item.sellingPrice || item.price) * item.quantity;
      if (item.offerPrice) {
        offerPriceTotal += item.offerPrice * item.quantity;
      }
      if (item.profit) {
        profitTotal += item.profit * item.quantity;
      }
    }
  });

  return {
    sellingPriceTotal,
    offerPriceTotal,
    profitTotal
  };
};


exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, transactionId, notes, extraCharge = 0 } = req.body;
    const userId = req.user.userId;

    // Validate shipping address and items (existing validation code)
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ msg: 'Please provide complete shipping address' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'No items in order' });
    }

    let subtotal = 0;
    let sellingPriceTotal = 0;
    let offerPriceTotal = 0;
    let profitTotal = 0;
    const orderItems = [];

    // Process each item with revenue calculations
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Insufficient stock for ${product.title}` });
      }

      // Calculate prices
      const finalPrice = product.offerPrice || product.sellingPrice;
      const itemTotal = finalPrice * item.quantity;
      subtotal += itemTotal;

      // Revenue calculations
      sellingPriceTotal += product.sellingPrice * item.quantity;
      if (product.offerPrice) {
        offerPriceTotal += product.offerPrice * item.quantity;
      }
      profitTotal += (product.profit || 0) * item.quantity;

      // Store detailed item information
      orderItems.push({
        productId: product._id,
        title: product.title,
        thumbnail: product.thumbnail,
        quantity: item.quantity,
        price: finalPrice, // The actual price charged
        sellingPrice: product.sellingPrice,
        offerPrice: product.offerPrice || null,
        profit: product.profit || 0,
        totalPrice: itemTotal
      });

      // Update product stock
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();
    }

    const deliveryCharge = 60;
    const totalAmount = subtotal + deliveryCharge + extraCharge;

    // Create order with revenue data
    const newOrder = new Order({
      userId,
      items: orderItems,
      subtotal,
      deliveryCharge,
      extraCharge,
      totalAmount,
      // Revenue tracking fields
      sellingPriceTotal,
      offerPriceTotal,
      profitTotal,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      paymentDetails: {
        transactionId,
        paidAt: new Date(),
        amount: totalAmount
      },
      notes
    });

    await newOrder.save();
    await User.findByIdAndUpdate(userId, { $push: { orders: newOrder._id } });

    // Clear cart logic (existing code)
    if (req.body.fromCart) {
      const orderedProductIds = items.map(item => item.productId);
      await Cart.findOneAndUpdate(
        { userId, status: 'active' },
        { $pull: { items: { productId: { $in: orderedProductIds } } } },
        { new: true }
      );
    }

    res.status(201).json({ 
      success: true, 
      msg: 'Order placed successfully', 
      order: newOrder 
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ msg: 'Server error while placing order', error: err.message });
  }
};


// @route   GET /api/orders/my
// @desc    Get current user's orders
// @access  Private (User)
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate('items.productId', 'title thumbnail')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching orders' });
  }
};

// @route   GET /api/orders/my/:orderId
// @desc    Get specific order details for user
// @access  Private (User)
exports.getUserOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId,
      userId: req.user.userId 
    })
    .populate('items.productId', 'title thumbnail companyName')
    .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching order' });
  }
};

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin)
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const { status, paymentStatus, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .populate({
        path: 'items.productId',
        select: 'title thumbnail sellingPrice offerPrice profit'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Calculate revenue for orders that might not have it stored
    const ordersWithRevenue = orders.map(order => {
      if (!order.sellingPriceTotal || !order.profitTotal) {
        const revenue = calculateOrderRevenue(order);
        return {
          ...order.toObject(),
          sellingPriceTotal: revenue.sellingPriceTotal,
          offerPriceTotal: revenue.offerPriceTotal,
          profitTotal: revenue.profitTotal
        };
      }
      return order;
    });

    const count = await Order.countDocuments(filter);

    res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      orders: ordersWithRevenue
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching all orders' });
  }
};

// @route   GET /api/orders/admin/:orderId
// @desc    Get specific order details (Admin)
// @access  Private (Admin)
exports.getOrderById = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'name email phone addresses')
      .populate('items.productId', 'title thumbnail companyName price')
      .populate('statusHistory.updatedBy', 'name');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching order' });
  }
};

// @route   PUT /api/orders/admin/:orderId/status
// @desc    Update order status (Admin)
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status, note, trackingNumber, estimatedDelivery } = req.body;

  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Update status
    const previousStatus = order.status;
    order.status = status;

    // Add to status history
    order.statusHistory.push({
      status,
      note: note || `Status changed from ${previousStatus} to ${status}`,
      updatedBy: req.user.userId
    });

    // Update payment status based on order status
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      order.paymentDetails = {
        paidAt: new Date(),
        amount: order.totalAmount
      };
      order.actualDelivery = new Date();
    }

    if (status === 'cancelled') {
      order.cancelReason = note;
      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { 
            stock: item.quantity,
            soldCount: -item.quantity
          }
        });
      }
    }

    // Update tracking info if provided
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    await order.save();

    res.json({ 
      success: true,
      msg: 'Order status updated successfully', 
      order 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while updating order status' });
  }
};

// @route   PUT /api/orders/admin/:orderId/payment
// @desc    Update payment status (Admin)
// @access  Private (Admin)
exports.updatePaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus, transactionId, amount } = req.body;

  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    
    if (paymentStatus === 'paid') {
      order.paymentDetails = {
        transactionId: transactionId || 'MANUAL',
        paidAt: new Date(),
        amount: amount || order.totalAmount
      };
    }

    // Add to status history
    order.statusHistory.push({
      status: order.status,
      note: `Payment status updated to ${paymentStatus}`,
      updatedBy: req.user.userId
    });

    await order.save();

    res.json({ 
      success: true,
      msg: 'Payment status updated successfully', 
      order 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while updating payment status' });
  }
};

// @route   GET /api/orders/admin/stats
// @desc    Get order statistics (Admin)
// @access  Private (Admin)
exports.getOrderStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalSellingPriceRevenue: { $sum: '$sellingPriceTotal' },
          totalOfferPriceRevenue: { $sum: '$offerPriceTotal' },
          totalProfit: { $sum: '$profitTotal' },
          averageOrderValue: { $avg: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          unpaidOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
          }
        }
      }
    ]);

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          profit: { $sum: '$profitTotal' }
        }
      }
    ]);

    const baseStats = stats[0] || {};
    const todayData = todayRevenue[0] || {};

    // Calculate profit margin
    const profitMargin = baseStats.totalRevenue > 0 
      ? (baseStats.totalProfit / baseStats.totalRevenue) * 100 
      : 0;

    res.json({
      success: true,
      stats: {
        ...baseStats,
        sellingPriceRevenue: baseStats.totalSellingPriceRevenue || 0,
        offerPriceRevenue: baseStats.totalOfferPriceRevenue || 0,
        profitMargin,
        todayOrders,
        todayRevenue: todayData.total || 0,
        todayProfit: todayData.profit || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching stats' });
  }
};