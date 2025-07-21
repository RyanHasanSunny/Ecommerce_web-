const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isParent: {
    type: Boolean,
    required: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function() {
      return this.isParent === false;  // If it's a child category, the parent category must be filled
    },
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
