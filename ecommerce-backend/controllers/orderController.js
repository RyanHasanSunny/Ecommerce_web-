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


// Updated placeOrder function with corrected pricing structure
exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, transactionId, notes, extraCharge = 0 } = req.body;
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

    // Process each item with NEW pricing structure
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Insufficient stock for ${product.title}` });
      }

      // Use the finalPrice (which is already calculated in the model)
      const itemTotal = product.finalPrice * item.quantity;
      subtotal += itemTotal;

      // Calculate totals for revenue tracking
      totalUnitPrice += product.price * item.quantity;
      totalProfit += product.profit * item.quantity;
      totalDeliveryCharge += (product.deliveryCharge || 0) * item.quantity;
      totalOfferValue += (product.offerValue || 0) * item.quantity;
      totalSellingPrice += product.sellingPrice * item.quantity;

      // Store detailed item information
      orderItems.push({
        productId: product._id,
        title: product.title,
        thumbnail: product.thumbnail,
        quantity: item.quantity,
        unitPrice: product.price,              // Unit price
        profit: product.profit,                // Profit per item
        deliveryCharge: product.deliveryCharge || 0,  // Delivery charge per item
        sellingPrice: product.sellingPrice,    // Calculated selling price
        offerValue: product.offerValue || 0,   // Discount per item
        finalPrice: product.finalPrice,        // Final price charged
        totalPrice: itemTotal                  // Total for this item
      });

      // Update product stock
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();
    }

    // Calculate delivery charge using existing function
    const deliveryCharge = calculateDeliveryCharge(shippingAddress.city, subtotal);
    const totalAmount = subtotal + deliveryCharge + extraCharge;

    // Create order with detailed revenue data
    const newOrder = new Order({
      userId,
      items: orderItems,
      subtotal,                    // Total of all items (finalPrice * quantity)
      deliveryCharge,              // Order-level delivery charge
      extraCharge,
      totalAmount,
      // Revenue tracking fields
      totalUnitPrice,              // Sum of all unit prices
      totalProfit,                 // Sum of all profits
      totalProductDeliveryCharge: totalDeliveryCharge,  // Product-level delivery charges
      totalSellingPrice,           // Sum of all selling prices
      totalOfferValue,             // Sum of all discounts
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
      order: newOrder
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ msg: 'Server error while placing order', error: err.message });
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
        // await Sell.findByIdAndUpdate(order.sellId, {
        //   $inc: {
        //     totalSell: -order.totalAmount
        //   }
        // });
      }
      // Restore sell revienew 

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