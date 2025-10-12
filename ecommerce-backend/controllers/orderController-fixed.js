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

    // Get cart to apply promo discount
    const cart = await Cart.findOne({ userId, status: 'active' });
    const appliedPromo = cart?.appliedPromo || null;
    const discountAmount = cart?.discountAmount || 0;
    const discountType = cart?.discountType || null;

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
      totalProfit += (product.finalPrice - product.price) * item.quantity; // FIXED: Profit = actual revenue - cost
      totalDeliveryCharge += (product.deliveryCharge || 0) * item.quantity;
      totalOfferValue += (product.offerValue || 0) * item.quantity;
      totalSellingPrice += product.finalPrice * item.quantity; // FIXED: Use finalPrice (actual revenue received)

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
    const totalAmount = subtotal + deliveryCharge + extraCharge - discountAmount;
    const netProfit = totalProfit - discountAmount;

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
      netProfit,
      appliedPromo,
      discountAmount,
      discountType,
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
        {
          $pull: { items: { productId: { $in: orderedProductIds } } },
          $unset: { appliedPromo: 1, discountAmount: 1, discountType: 1 }
        },
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
      totalProfit += ((item.productId.finalPrice || item.finalPrice) - (item.productId.price || item.unitPrice)) * quantity; // FIXED: Profit = actual revenue - cost
      totalSellingPrice += ((item.productId.finalPrice || item.finalPrice) || 0) * quantity; // FIXED: Use finalPrice (actual revenue received)
      totalOfferValue += (item.productId.offerValue || item.offerValue || 0) * quantity;
    } else {
      // Fallback to stored item data
      totalUnitPrice += (item.unitPrice || item.price) * quantity;
      totalProfit += ((item.finalPrice || item.totalPrice) - (item.unitPrice || item.price)) * quantity; // FIXED: Profit = actual revenue - cost
      totalSellingPrice += ((item.finalPrice || item.totalPrice) || 0) * quantity; // FIXED: Use finalPrice (actual revenue received)
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

// Export the calculateOrderRevenue function for use in other files
module.exports.calculateOrderRevenue = calculateOrderRevenue;
