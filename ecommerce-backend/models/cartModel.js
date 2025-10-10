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
    required: true
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
    enum: ['percent', 'fixed'],
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