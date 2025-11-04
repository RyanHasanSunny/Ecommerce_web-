const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made optional for guest carts
  },

  sessionId: {
    type: String,
    required: false, // For guest carts
    trim: true,
    index: true // Add index for better query performance
  },
  
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  appliedPromo: {
    type: String,
    default: null,
    trim: true
  },

  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  discountType: {
    type: String,
    enum: ['percentage', 'fixed'], // Updated to match controller usage
    default: null
  },

  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'pending', 'completed'],
    default: 'active'
  }
  
}, { 
  timestamps: true 
});

// Pre-save middleware to calculate total amount
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + item.totalPrice;
  }, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);