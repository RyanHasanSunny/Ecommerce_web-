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
    price: {
      type: Number,
      required: true // The actual price charged to customer
    },
    // New revenue tracking fields for each item
    sellingPrice: {
      type: Number,
      required: true // Original selling price
    },
    offerPrice: {
      type: Number,
      default: null // Discounted price if applicable
    },
    profit: {
      type: Number,
      default: 0 // Profit per unit
    },
    totalPrice: {
      type: Number,
      required: true // Total for this item (price × quantity)
    }
  }],
  
  // Order totals
  subtotal: {
    type: Number,
    required: true
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  extraCharge: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // New revenue tracking fields for the entire order
  sellingPriceTotal: {
    type: Number,
    default: 0 // Total if all items sold at selling price
  },
  offerPriceTotal: {
    type: Number,
    default: 0 // Total value of discounts given
  },
  profitTotal: {
    type: Number,
    default: 0 // Total profit from this order
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
    enum: ['cod', 'bkash', 'nagad', 'rocket', 'bank_transfer', 'card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded', 'failed'],
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

// Virtual for calculating profit margin percentage
orderSchema.virtual('profitMargin').get(function() {
  if (this.totalAmount > 0) {
    return (this.profitTotal / this.totalAmount) * 100;
  }
  return 0;
});

// Virtual for calculating discount amount
orderSchema.virtual('discountAmount').get(function() {
  return this.sellingPriceTotal - this.subtotal;
});

// Method to calculate revenue metrics if not stored
orderSchema.methods.calculateRevenue = function() {
  let sellingPriceTotal = 0;
  let offerPriceTotal = 0;
  let profitTotal = 0;

  this.items.forEach(item => {
    const quantity = item.quantity;
    sellingPriceTotal += (item.sellingPrice || item.price) * quantity;
    
    if (item.offerPrice) {
      offerPriceTotal += item.offerPrice * quantity;
    }
    
    if (item.profit) {
      profitTotal += item.profit * quantity;
    }
  });

  return {
    sellingPriceTotal,
    offerPriceTotal,
    profitTotal
  };
};

// Pre-save middleware to ensure revenue calculations
orderSchema.pre('save', function(next) {
  // If revenue fields are missing, calculate them
  if (!this.sellingPriceTotal || !this.profitTotal) {
    const revenue = this.calculateRevenue();
    this.sellingPriceTotal = revenue.sellingPriceTotal;
    this.offerPriceTotal = revenue.offerPriceTotal;
    this.profitTotal = revenue.profitTotal;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);