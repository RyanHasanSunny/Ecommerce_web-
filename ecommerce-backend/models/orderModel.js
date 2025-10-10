const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    thumbnail: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    // NEW PRICING STRUCTURE FOR EACH ITEM
    unitPrice: {
      type: Number,
      required: true // Base cost of the product
    },
    profit: {
      type: Number,
      required: true, // Profit margin per unit
      default: 0
    },
    deliveryCharge: {
      type: Number,
      default: 0 // Product-specific delivery charge per unit
    },
    sellingPrice: {
      type: Number,
      required: true // unitPrice + profit + deliveryCharge
    },
    offerValue: {
      type: Number,
      default: 0 // Discount amount per unit (not price)
    },
    finalPrice: {
      type: Number,
      required: true // sellingPrice - offerValue (actual price charged)
    },
    totalPrice: {
      type: Number,
      required: true // finalPrice × quantity
    }
  }],
  
  // Order totals
  subtotal: {
    type: Number,
    required: true // Sum of all item totals (finalPrice × quantity)
  },
  deliveryCharge: {
    type: Number,
    default: 0 // Order-level delivery charge
  },
  extraCharge: {
    type: Number,
    default: 0 // Any additional charges
  },
  totalAmount: {
    type: Number,
    required: true // subtotal + deliveryCharge + extraCharge
  },
  paidAmount: {
    type: Number,
    required: true
  },

  dueAmount: {
    type: Number,
    required: true
  },
  
  // NEW REVENUE TRACKING FIELDS FOR THE ENTIRE ORDER
  totalUnitPrice: {
    type: Number,
    required: true, // Sum of all unit prices
    default: 0
  },
  totalProfit: {
    type: Number,
    required: true, // Sum of all profits
    default: 0
  },
  totalProductDeliveryCharge: {
    type: Number,
    default: 0 // Sum of product-specific delivery charges
  },
  totalSellingPrice: {
    type: Number,
    required: true, // Sum of all selling prices (before discounts)
    default: 0
  },
  totalOfferValue: {
    type: Number,
    default: 0 // Sum of all discount amounts
  },

  // Promo code discount
  appliedPromo: String,
  discountAmount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed']
  },
  
  // Shipping information
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: String,
    country: {
      type: String,
      default: 'Bangladesh'
    }
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: [ 'cod', 'bkash', 'nagad', 'rocket', 'bank_transfer', 'card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['cod','unpaid', 'paid', 'refunded', 'failed'],
    default: 'unpaid'
  },
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
    amount: Number,
    method: String
  },
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Status history for tracking
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tracking information
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Additional information
  notes: String,
  cancelReason: String,
  
  // Internal fields
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'paymentDetails.transactionId': 1 });
orderSchema.index({ createdAt: -1 });

// UPDATED Virtual for calculating profit margin percentage
orderSchema.virtual('profitMargin').get(function() {
  if (this.totalSellingPrice > 0) {
    return (this.totalProfit / this.totalSellingPrice) * 100;
  }
  return 0;
});

// UPDATED Virtual for calculating total discount amount
orderSchema.virtual('totalDiscountAmount').get(function() {
  return this.totalOfferValue || 0;
});

// Virtual for calculating discount percentage
orderSchema.virtual('discountPercentage').get(function() {
  if (this.totalSellingPrice > 0) {
    return (this.totalOfferValue / this.totalSellingPrice) * 100;
  }
  return 0;
});

// Virtual for calculating average order value
orderSchema.virtual('averageItemValue').get(function() {
  if (this.items.length > 0) {
    return this.subtotal / this.items.length;
  }
  return 0;
});

// UPDATED Method to calculate revenue metrics if not stored
orderSchema.methods.calculateRevenue = function() {
  let totalUnitPrice = 0;
  let totalProfit = 0;
  let totalProductDeliveryCharge = 0;
  let totalSellingPrice = 0;
  let totalOfferValue = 0;

  this.items.forEach(item => {
    const quantity = item.quantity;
    
    // Use new pricing structure fields
    totalUnitPrice += (item.unitPrice || 0) * quantity;
    totalProfit += (item.profit || 0) * quantity;
    totalProductDeliveryCharge += (item.deliveryCharge || 0) * quantity;
    totalSellingPrice += (item.sellingPrice || 0) * quantity;
    totalOfferValue += (item.offerValue || 0) * quantity;
  });

  return {
    totalUnitPrice,
    totalProfit,
    totalProductDeliveryCharge,
    totalSellingPrice,
    totalOfferValue
  };
};

// Method to validate pricing consistency
orderSchema.methods.validatePricing = function() {
  const errors = [];
  
  this.items.forEach((item, index) => {
    // Check if sellingPrice = unitPrice + profit + deliveryCharge
    const expectedSellingPrice = item.unitPrice + item.profit + (item.deliveryCharge || 0);
    if (Math.abs(item.sellingPrice - expectedSellingPrice) > 0.01) {
      errors.push(`Item ${index}: Selling price mismatch. Expected: ${expectedSellingPrice}, Got: ${item.sellingPrice}`);
    }
    
    // Check if finalPrice = sellingPrice - offerValue
    const expectedFinalPrice = item.sellingPrice - (item.offerValue || 0);
    if (Math.abs(item.finalPrice - expectedFinalPrice) > 0.01) {
      errors.push(`Item ${index}: Final price mismatch. Expected: ${expectedFinalPrice}, Got: ${item.finalPrice}`);
    }
    
    // Check if totalPrice = finalPrice × quantity
    const expectedTotalPrice = item.finalPrice * item.quantity;
    if (Math.abs(item.totalPrice - expectedTotalPrice) > 0.01) {
      errors.push(`Item ${index}: Total price mismatch. Expected: ${expectedTotalPrice}, Got: ${item.totalPrice}`);
    }
  });
  
  return errors;
};

// UPDATED Pre-save middleware to ensure revenue calculations and validation
orderSchema.pre('save', function(next) {
  // Calculate revenue fields if missing
  if (!this.totalUnitPrice || !this.totalProfit || !this.totalSellingPrice) {
    const revenue = this.calculateRevenue();
    this.totalUnitPrice = revenue.totalUnitPrice;
    this.totalProfit = revenue.totalProfit;
    this.totalProductDeliveryCharge = revenue.totalProductDeliveryCharge;
    this.totalSellingPrice = revenue.totalSellingPrice;
    this.totalOfferValue = revenue.totalOfferValue;
  }
  
  // Validate pricing consistency (optional - comment out in production if needed)
  const pricingErrors = this.validatePricing();
  if (pricingErrors.length > 0) {
    console.warn('Pricing validation warnings:', pricingErrors);
    // You can choose to throw an error here if you want strict validation
    // return next(new Error('Pricing validation failed: ' + pricingErrors.join(', ')));
  }
  
  next();
});

// Static method to get revenue statistics
orderSchema.statics.getRevenueStats = async function(dateRange = {}) {
  const matchStage = { isDeleted: { $ne: true } };
  
  if (dateRange.startDate || dateRange.endDate) {
    matchStage.createdAt = {};
    if (dateRange.startDate) matchStage.createdAt.$gte = new Date(dateRange.startDate);
    if (dateRange.endDate) matchStage.createdAt.$lte = new Date(dateRange.endDate);
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalUnitPrice: { $sum: '$totalUnitPrice' },
        totalProfit: { $sum: '$totalProfit' },
        totalSellingPrice: { $sum: '$totalSellingPrice' },
        totalOfferValue: { $sum: '$totalOfferValue' },
        totalProductDeliveryCharge: { $sum: '$totalProductDeliveryCharge' },
        averageOrderValue: { $avg: '$totalAmount' },
        averageProfit: { $avg: '$totalProfit' }
      }
    }
  ]);
  
  return stats[0] || {};
};

module.exports = mongoose.model('Order', orderSchema);