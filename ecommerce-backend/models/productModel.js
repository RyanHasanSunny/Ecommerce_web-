const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  image: {
    type: String
  },
  soldCount: {
    type: Number,
    default: 0, // Default value for sold count
  },
  searchCount: {
    type: Number,
    default: 0, // Default value for search count
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
