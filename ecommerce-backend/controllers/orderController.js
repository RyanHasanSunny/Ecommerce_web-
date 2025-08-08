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

// @route   POST /api/orders/place
// @desc    Place a new order
// @access  Private (User)
// exports.placeOrder = async (req, res) => {
//   const userId = req.user.userId;
//   const { 
//     items,
//     shippingAddress, 
//     paymentMethod,
//     notes,
//     extraCharge = 0
//   } = req.body;

//   try {
//     // Validate shipping address
//     if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
//         !shippingAddress.address || !shippingAddress.city) {
//       return res.status(400).json({ 
//         msg: 'Please provide complete shipping address' 
//       });
//     }

//     // Validate items
//     if (!items || items.length === 0) {
//       return res.status(400).json({ msg: 'No items in order' });
//     }

//     // Calculate subtotal and validate products
//     let subtotal = 0;
//     const orderItems = [];

//     for (const item of items) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         return res.status(404).json({ 
//           msg: `Product not found: ${item.productId}` 
//         });
//       }

//       // Check stock
//       if (product.stock < item.quantity) {
//         return res.status(400).json({ 
//           msg: `Insufficient stock for ${product.title}` 
//         });
//       }

//       const itemTotal = product.sellingPrice * item.quantity;
//       subtotal += itemTotal;

//       orderItems.push({
//         productId: product._id,
//         title: product.title,
//         thumbnail: product.thumbnail,
//         quantity: item.quantity,
//         price: product.sellingPrice,
//         totalPrice: itemTotal
//       });

//       // Update product stock
//       product.stock -= item.quantity;
//       product.soldCount += item.quantity;
//       await product.save();
//     }

//     // Calculate charges
//     const deliveryCharge = calculateDeliveryCharge(shippingAddress.city, subtotal);
//     const totalAmount = subtotal + deliveryCharge + extraCharge;

//     // Create order
//     const newOrder = new Order({
//       userId,
//       items: orderItems,
//       subtotal,
//       deliveryCharge,
//       extraCharge,
//       totalAmount,
//       shippingAddress,
//       paymentMethod,
//       paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
//       notes
//     });

//     await newOrder.save();

//     // Add order to user's orders
//     await User.findByIdAndUpdate(userId, {
//       $push: { orders: newOrder._id }
//     });

//     // Clear user's cart if order was from cart
//     if (req.body.fromCart) {
//       await Cart.findOneAndUpdate(
//         { userId, status: 'active' },
//         { status: 'completed', items: [] }
//       );
//     }

//     res.status(201).json({ 
//       success: true,
//       msg: 'Order placed successfully', 
//       order: newOrder 
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: 'Server error while placing order' });
//   }
// };





exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, transactionId, notes, extraCharge = 0 } = req.body;
    console.log('Request data:', req.body);  // Log request data

    const userId = req.user.userId;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ msg: 'Please provide complete shipping address' });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'No items in order' });
    }

    let subtotal = 0;
    const orderItems = [];

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product not found: ${item.productId}` });
      }

      // Check if stock is available
      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Insufficient stock for ${product.title}` });
      }

      // Calculate total price for the item
      const itemTotal = product.sellingPrice * item.quantity;
      subtotal += itemTotal;

      // Push the item data into the orderItems array
      orderItems.push({
        productId: product._id,
        title: product.title,
        thumbnail: product.thumbnail,
        quantity: item.quantity,
        price: product.sellingPrice,
        totalPrice: itemTotal
      });

      // Update product stock
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();
    }

    const deliveryCharge = 60; // Example delivery charge, modify as needed
    const totalAmount = subtotal + deliveryCharge + extraCharge;

    // Create a new order
    const newOrder = new Order({
      userId,
      items: orderItems,
      subtotal,
      deliveryCharge,
      extraCharge,
      totalAmount,
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

    // Save the new order
    await newOrder.save();
    await User.findByIdAndUpdate(userId, { $push: { orders: newOrder._id } });

    // If the order was placed from the cart, remove ordered items from the user's cart
   if (req.body.fromCart) {
  const orderedProductIds = items.map(item => item.productId);

  // Log the ordered product IDs
  console.log('Ordered product IDs:', orderedProductIds);

  // Find and update the cart
  const updatedCart = await Cart.findOneAndUpdate(
    { userId, status: 'active' },
    { 
      $pull: { items: { productId: { $in: orderedProductIds } } }
    },
    { new: true }  // Ensure the updated cart is returned
  );

  // Log the updated cart after pulling items
  console.log('Updated Cart after pulling items:', updatedCart);
}

    // Respond with success message
    res.status(201).json({ success: true, msg: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('Error placing order:', err); // Detailed logging for error
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
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const { status, paymentStatus, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(filter);

    res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      orders
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
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
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

    // Get today's orders
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
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        ...stats[0],
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching stats' });
  }
};