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

// Updated placeOrder function with corrected pricing structure and COD partial payment
// Fixed placeOrder function in orderController.js

exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, transactionId, notes, extraCharge = 0, paidAmount, isCOD } = req.body;
    const userId = req.user.userId;

    // Validation (existing code remains same)
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ msg: 'Please provide complete shipping address' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'No items in order' });
    }

    let subtotal = 0;
    let totalUnitPrice = 0;
    let totalProfit = 0;
    let totalDeliveryCharge = 0;
    let totalOfferValue = 0;
    let totalSellingPrice = 0;
    const orderItems = [];

    // Process each item with NEW pricing structure (existing code remains same)
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Insufficient stock for ${product.title}` });
      }

      const itemTotal = product.finalPrice * item.quantity;
      subtotal += itemTotal;

      totalUnitPrice += product.price * item.quantity;
      totalProfit += product.profit * item.quantity;
      totalDeliveryCharge += (product.deliveryCharge || 0) * item.quantity;
      totalOfferValue += (product.offerValue || 0) * item.quantity;
      totalSellingPrice += product.sellingPrice * item.quantity;

      orderItems.push({
        productId: product._id,
        title: product.title,
        thumbnail: product.thumbnail,
        quantity: item.quantity,
        unitPrice: product.price,
        profit: product.profit,
        deliveryCharge: product.deliveryCharge || 0,
        sellingPrice: product.sellingPrice,
        offerValue: product.offerValue || 0,
        finalPrice: product.finalPrice,
        totalPrice: itemTotal
      });

      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();
    }

    const deliveryCharge = calculateDeliveryCharge(shippingAddress.city, subtotal);
    const totalAmount = subtotal + deliveryCharge + extraCharge;

    // FIXED: Calculate paidAmount and payment status based on order type
    let calculatedPaidAmount;
    let calculatedDueAmount;
    let paymentStatus;

    if (isCOD) {
      // COD Order: Can have partial advance payment
      calculatedPaidAmount = paidAmount || 0;
      calculatedDueAmount = totalAmount - calculatedPaidAmount;
      
      // Payment status is 'cod' for COD orders (regardless of advance payment)
      paymentStatus = 'cod';
      
      // Validation for COD
      if (calculatedPaidAmount > totalAmount) {
        return res.status(400).json({ 
          msg: 'Paid amount cannot be greater than total amount',
          totalAmount,
          paidAmount: calculatedPaidAmount 
        });
      }
      
      if (calculatedPaidAmount < 0) {
        return res.status(400).json({ msg: 'Paid amount cannot be negative' });
      }
    } else {
      // Regular Payment: Full payment required
      calculatedPaidAmount = totalAmount;
      calculatedDueAmount = 0;
      paymentStatus = 'paid';
    }

    // Create order with corrected logic
    const newOrder = new Order({
      userId,
      items: orderItems,
      subtotal,
      deliveryCharge,
      extraCharge,
      totalAmount,
      paidAmount: calculatedPaidAmount,
      dueAmount: calculatedDueAmount,
      totalUnitPrice,
      totalProfit,
      totalProductDeliveryCharge: totalDeliveryCharge,
      totalSellingPrice,
      totalOfferValue,
      shippingAddress,
      paymentMethod, // This will be the actual gateway: bkash, nagad, rocket, card, or 'cod' for pure COD
      paymentStatus, // This will be 'cod' for COD orders, 'paid' for full payments
      paymentDetails: {
        transactionId,
        paidAt: calculatedPaidAmount > 0 ? new Date() : null,
        amount: calculatedPaidAmount,
        method: paymentMethod
      },
      notes
    });

    await newOrder.save();
    await User.findByIdAndUpdate(userId, { $push: { orders: newOrder._id } });

    // Clear cart logic (existing code remains same)
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
      order: newOrder,
      paymentSummary: {
        totalAmount,
        paidAmount: calculatedPaidAmount,
        dueAmount: calculatedDueAmount,
        paymentMethod,
        paymentStatus,
        isCOD: isCOD || false
      }
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ msg: 'Server error while placing order', error: err.message });
  }
};

// New function to handle due amount payment
exports.payDueAmount = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, paymentMethod, transactionId } = req.body;
    const userId = req.user.userId;

    // Find the order
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if there's any due amount
    if (order.dueAmount <= 0) {
      return res.status(400).json({ msg: 'No due amount remaining for this order' });
    }

    // Validate payment amount
    if (amount <= 0 || amount > order.dueAmount) {
      return res.status(400).json({ 
        msg: 'Invalid payment amount',
        dueAmount: order.dueAmount,
        providedAmount: amount
      });
    }

    // Update payment details
    order.paidAmount += amount;
    order.dueAmount -= amount;

    // Update payment status if fully paid
    if (order.dueAmount <= 0) {
      order.paymentStatus = 'paid';
      order.dueAmount = 0; // Ensure it's exactly 0
    }

    // Add payment transaction to history
    order.paymentDetails = {
      ...order.paymentDetails,
      lastPayment: {
        transactionId,
        amount,
        method: paymentMethod,
        paidAt: new Date()
      }
    };

    // Add to status history
    order.statusHistory.push({
      status: order.status,
      note: `Payment of ৳${amount} received. ${order.dueAmount > 0 ? `Remaining due: ৳${order.dueAmount}` : 'Fully paid'}`,
      updatedBy: userId,
      updatedAt: new Date()
    });

    await order.save();

    res.json({
      success: true,
      msg: 'Payment received successfully',
      paymentSummary: {
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus
      },
      order
    });

  } catch (err) {
    console.error('Error processing due payment:', err);
    res.status(500).json({ msg: 'Server error while processing payment', error: err.message });
  }
};

// Updated calculateOrderRevenue function
const calculateOrderRevenue = (order) => {
  let totalUnitPrice = 0;
  let totalProfit = 0;
  let totalSellingPrice = 0;
  let totalOfferValue = 0;

  order.items.forEach(item => {
    const quantity = item.quantity;

    if (item.productId) {
      // Use product data if available
      totalUnitPrice += (item.productId.price || item.unitPrice) * quantity;
      totalProfit += (item.productId.profit || item.profit) * quantity;
      totalSellingPrice += (item.productId.sellingPrice || item.sellingPrice) * quantity;
      totalOfferValue += (item.productId.offerValue || item.offerValue || 0) * quantity;
    } else {
      // Fallback to stored item data
      totalUnitPrice += (item.unitPrice || item.price) * quantity;
      totalProfit += (item.profit || 0) * quantity;
      totalSellingPrice += (item.sellingPrice || item.price) * quantity;
      totalOfferValue += (item.offerValue || 0) * quantity;
    }
  });

  return {
    totalUnitPrice,
    totalProfit,
    totalSellingPrice,
    totalOfferValue
  };
};

// @route   GET /api/orders/my
// @desc    Get current user's orders with payment summary
// @access  Private (User)
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate('items.productId', 'title thumbnail')
      .sort({ createdAt: -1 });

    // Add payment summary to each order
    const ordersWithPaymentInfo = orders.map(order => ({
      ...order.toObject(),
      paymentSummary: {
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
        hasDue: order.dueAmount > 0
      }
    }));

    res.json({
      success: true,
      count: orders.length,
      orders: ordersWithPaymentInfo
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

    // Add payment summary
    const orderWithPaymentInfo = {
      ...order.toObject(),
      paymentSummary: {
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
        hasDue: order.dueAmount > 0
      }
    };

    res.json({
      success: true,
      order: orderWithPaymentInfo
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

    // Calculate revenue for orders that might not have it stored and add payment info
    const ordersWithRevenue = orders.map(order => {
      const orderObj = order.toObject();
      
      if (!order.totalSellingPrice || !order.totalProfit) {
        const revenue = calculateOrderRevenue(order);
        orderObj.totalSellingPrice = revenue.totalSellingPrice;
        orderObj.totalOfferValue = revenue.totalOfferValue;
        orderObj.totalProfit = revenue.totalProfit;
      }
      
      // Add payment summary
      orderObj.paymentSummary = {
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
        hasDue: order.dueAmount > 0
      };
      
      return orderObj;
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

    // Add payment summary
    const orderWithPaymentInfo = {
      ...order.toObject(),
      paymentSummary: {
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
        hasDue: order.dueAmount > 0
      }
    };

    res.json({
      success: true,
      order: orderWithPaymentInfo
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
  const { status, note, trackingNumber, estimatedDelivery, collectDueAmount } = req.body;

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
    if (status === 'delivered') {
      order.actualDelivery = new Date();
      
      // If COD and there's due amount, either collect it or mark as needed
      if (order.paymentMethod === 'cod' && order.dueAmount > 0) {
        if (collectDueAmount === true) {
          // Mark as fully paid if due amount was collected on delivery
          const collectedAmount = order.dueAmount;
          order.paidAmount = order.totalAmount;
          order.dueAmount = 0;
          order.paymentStatus = 'paid';
          order.paymentDetails = {
            ...order.paymentDetails,
            deliveryPayment: {
              amount: collectedAmount,
              collectedAt: new Date(),
              method: 'cod'
            }
          };
          
          // Add payment note to status history
          order.statusHistory.push({
            status,
            note: `Due amount of ৳${collectedAmount} collected on delivery`,
            updatedBy: req.user.userId
          });
        }
        // If collectDueAmount is false or not provided, keep as partial payment
      } else if (order.paymentMethod === 'cod' && order.dueAmount <= 0) {
        // Already fully paid COD order
        order.paymentStatus = 'paid';
      }
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
      order,
      paymentSummary: {
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus
      }
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
  const { paymentStatus, transactionId, amount, updateType } = req.body;

  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const previousTotalAmount = order.totalAmount;
    const previousDueAmount = order.dueAmount;
    const previousPaidAmount = order.paidAmount;

    // Handle different update types
    if (updateType === 'totalAmount') {
      // Update total amount - this affects due amount calculation
      const newTotalAmount = parseFloat(amount);
      if (newTotalAmount < 0) {
        return res.status(400).json({ msg: 'Total amount cannot be negative' });
      }

      order.totalAmount = newTotalAmount;
      // Recalculate due amount: due = total - paid
      order.dueAmount = Math.max(0, newTotalAmount - order.paidAmount);

      // Update payment status based on new amounts
      if (order.dueAmount <= 0) {
        order.paymentStatus = 'paid';
        order.dueAmount = 0;
      } else if (order.paidAmount > 0) {
        order.paymentStatus = 'cod'; // Partial payment
      } else {
        order.paymentStatus = 'unpaid';
      }

    } else if (updateType === 'dueAmount') {
      // Update due amount directly - this affects paid amount calculation
      const newDueAmount = parseFloat(amount);
      if (newDueAmount < 0) {
        return res.status(400).json({ msg: 'Due amount cannot be negative' });
      }
      if (newDueAmount > order.totalAmount) {
        return res.status(400).json({
          msg: 'Due amount cannot exceed total amount',
          totalAmount: order.totalAmount,
          requestedDueAmount: newDueAmount
        });
      }

      order.dueAmount = newDueAmount;
      // Recalculate paid amount: paid = total - due
      order.paidAmount = order.totalAmount - newDueAmount;

      // Update payment status based on new amounts
      if (order.dueAmount <= 0) {
        order.paymentStatus = 'paid';
        order.dueAmount = 0;
        order.paidAmount = order.totalAmount;
      } else if (order.paidAmount > 0) {
        order.paymentStatus = 'cod'; // Partial payment
      } else {
        order.paymentStatus = 'unpaid';
      }

    } else {
      // Legacy payment update (receiving payment)
      if (paymentStatus === 'paid') {
        const paymentAmount = amount || order.dueAmount;
        order.paidAmount += paymentAmount;
        order.dueAmount = Math.max(0, order.dueAmount - paymentAmount);

        if (order.dueAmount <= 0) {
          order.paymentStatus = 'paid';
          order.dueAmount = 0;
        }

        order.paymentDetails = {
          ...order.paymentDetails,
          transactionId: transactionId || 'MANUAL',
          paidAt: new Date(),
          amount: order.paidAmount
        };
      } else {
        order.paymentStatus = paymentStatus;
      }
    }

    // Update payment details
    if (transactionId) {
      order.paymentDetails = {
        ...order.paymentDetails,
        transactionId,
        lastUpdated: new Date()
      };
    }

    // Add to status history with detailed note
    let historyNote = '';
    if (updateType === 'totalAmount') {
      historyNote = `Total amount updated from ৳${previousTotalAmount} to ৳${order.totalAmount}. Due amount: ৳${order.dueAmount}`;
    } else if (updateType === 'dueAmount') {
      historyNote = `Due amount updated from ৳${previousDueAmount} to ৳${order.dueAmount}. Paid amount: ৳${order.paidAmount}`;
    } else {
      historyNote = `Payment status updated to ${paymentStatus}${amount ? ` with amount ৳${amount}` : ''}`;
    }

    order.statusHistory.push({
      status: order.status,
      note: historyNote,
      updatedBy: req.user.userId
    });

    await order.save();

    res.json({
      success: true,
      msg: 'Payment status updated successfully',
      order,
      paymentSummary: {
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
        updateType: updateType || 'payment'
      }
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

// Get revenue stats only for delivered orders
const revenueStats = await Order.aggregate([
      {
        $match: { status: 'delivered' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalPaidAmount: { $sum: '$paidAmount' },
          totalDueAmount: { $sum: '$dueAmount' },
          totalSellingPriceRevenue: { $sum: '$totalSellingPrice' },
          totalOfferPriceRevenue: { $sum: '$totalOfferValue' },
          totalProfit: { $sum: '$totalProfit' },
          averageOrderValue: { $avg: '$totalAmount' },
          deliveredOrders: { $sum: 1 },
          paidOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          codOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'cod'] }, 1, 0] }
          },
          ordersWithDue: {
            $sum: { $cond: [{ $gt: ['$dueAmount', 0] }, 1, 0] }
          }
        }
      }
    ]);

// Get order counts for all orders
const orderCounts = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          unpaidOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
          }
        }
      }
    ]);

// Combine the results
const revenueData = revenueStats[0] || {};
const countData = orderCounts[0] || {};
const baseStats = { ...revenueData, ...countData };

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

const todayRevenue = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          paid: { $sum: '$paidAmount' },
          due: { $sum: '$dueAmount' },
          profit: { $sum: '$totalProfit' }
        }
      }
    ]);
    const todayData = todayRevenue[0] || {};

    // Calculate profit margin
    const profitMargin = baseStats.totalRevenue > 0
      ? (baseStats.totalProfit / baseStats.totalRevenue) * 100
      : 0;

    // Calculate collection rate
    const collectionRate = baseStats.totalRevenue > 0
      ? (baseStats.totalPaidAmount / baseStats.totalRevenue) * 100
      : 0;

    res.json({
      success: true,
      stats: {
        ...baseStats,
        sellingPriceRevenue: baseStats.totalSellingPriceRevenue || 0,
        offerPriceRevenue: baseStats.totalOfferPriceRevenue || 0,
        profitMargin,
        collectionRate,
        todayOrders,
        todayRevenue: todayData.total || 0,
        todayPaidAmount: todayData.paid || 0,
        todayDueAmount: todayData.due || 0,
        todayProfit: todayData.profit || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching stats' });
  }
};

// @route   GET /api/orders/due-payments
// @desc    Get orders with pending due amounts
// @access  Private (Admin)
exports.getDuePayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 10 } = req.query;

    const ordersWithDue = await Order.find({ dueAmount: { $gt: 0 } })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments({ dueAmount: { $gt: 0 } });

    // Add payment summary to each order
    const ordersWithPaymentInfo = ordersWithDue.map(order => ({
      ...order.toObject(),
      paymentSummary: {
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus,
        hasDue: order.dueAmount > 0
      }
    }));

    res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      orders: ordersWithPaymentInfo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching due payments' });
  }
};