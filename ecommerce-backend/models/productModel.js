const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  specifications: [
    {
      title: {
        type: String,
        required: true
      },
      details: {
        type: String,
        required: true
      }
    }
  ],
  price: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  images: [{        // Changed from single image to array
    type: String
  }],
  soldCount: {
    type: Number,
    default: 0
  },
  searchCount: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
