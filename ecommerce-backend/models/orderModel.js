const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  
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
    title: String,
    thumbnail: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],

  // Pricing details
  subtotal: {
    type: Number,
    required: true
  },
  
  deliveryCharge: {
    type: Number,
    required: true,
    default: 50 // Default delivery charge
  },
  
  extraCharge: {
    type: Number,
    default: 0
  },
  
  discount: {
    type: Number,
    default: 0
  },
  
  totalAmount: {
    type: Number,
    required: true
  },

  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // Payment details
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'card'],
    required: true
  },
  
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
    amount: Number
  },

  // Shipping details
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String,
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Bangladesh'
    }
  },

  // Tracking
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,

  // Status history
  statusHistory: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Additional info
  notes: String,
  cancelReason: String

}, { timestamps: true });

// Generate order ID before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the last order of the day
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const lastOrder = await this.constructor.findOne({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });
    
    const orderNumber = lastOrder ? 
      (parseInt(lastOrder.orderId.slice(-4)) + 1).toString().padStart(4, '0') : 
      '0001';
    
    this.orderId = `ORD${year}${month}${day}${orderNumber}`;
    
    // Add initial status to history
    this.statusHistory.push({
      status: this.status,
      note: 'Order placed'
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);