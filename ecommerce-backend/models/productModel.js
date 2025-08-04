const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  specifications: [
    {
      title: { type: String, required: true },
      details: { type: String, required: true }
    }
  ],
  price: { type: Number, required: true },       // base price
  profit: { type: Number, required: true },      // profit margin
  sellingPrice: { type: Number, required: true }, // auto-calculated
  offerPrice: { type: Number, default: null },    // optional
  stock: { type: Number, required: true, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  thumbnail: { type: String, required: true },   // main image
  images: [{ type: String }],                    // additional images
  soldCount: { type: Number, default: 0 },
  searchCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
