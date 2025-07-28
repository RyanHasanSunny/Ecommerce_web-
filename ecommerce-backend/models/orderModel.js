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
    name: String,
    quantity: Number,
    price: Number,
    totalPrice: Number
  }],

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'paypal'],
    default: 'cod'
  },

  shippingAddress: {
    type: String,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
