const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  description: { type: String, required: true, trim: true },
  specifications: [
    {
      title: { type: String, required: true },
      details: { type: String, required: true }
    }
  ],
  price: { type: Number, required: true },           // Unit price (base cost)
  expectedProfit: { type: Number, required: true },  // Expected profit margin
  deliveryCharge: { type: Number, default: 0 },      // Delivery charge (optional)
  sellingPrice: { type: Number },                    // Auto-calculated: price + expectedProfit + deliveryCharge (REMOVED required: true)
  offerValue: { type: Number, default: 0 },          // Discount amount (not price)
  finalPrice: { type: Number },                      // Auto-calculated: sellingPrice - offerValue (REMOVED required: true)
  stock: { type: Number, required: true, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  thumbnail: { type: String, required: true },       // main image
  images: [{ type: String }],                        // additional images
  soldCount: { type: Number, default: 0 },
  searchCount: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save middleware to auto-calculate selling price and final price
productSchema.pre('save', function(next) {
  // Calculate selling price: unit price + expectedProfit + delivery charge - offer value
  this.sellingPrice = this.price + this.expectedProfit + (this.deliveryCharge || 0) - (this.offerValue || 0);

  // Calculate final price: same as selling price since offer value is already subtracted
  this.finalPrice = this.sellingPrice;

  // Ensure final price is not negative
  if (this.finalPrice < 0) {
    this.finalPrice = 0;
  }

  next();
});

// Virtual to get price breakdown
productSchema.virtual('priceBreakdown').get(function() {
  return {
    unitPrice: this.price,
    expectedProfit: this.expectedProfit,
    deliveryCharge: this.deliveryCharge || 0,
    sellingPrice: this.sellingPrice,
    offerValue: this.offerValue || 0,
    finalPrice: this.finalPrice,
    savings: this.offerValue || 0,
    discountPercentage: this.sellingPrice > 0 ? ((this.offerValue || 0) / this.sellingPrice * 100).toFixed(1) : 0
  };
});

// Method to update pricing
productSchema.methods.updatePricing = function(updates) {
  if (updates.price !== undefined) this.price = updates.price;
  if (updates.expectedProfit !== undefined) this.expectedProfit = updates.expectedProfit;
  if (updates.deliveryCharge !== undefined) this.deliveryCharge = updates.deliveryCharge;
  if (updates.offerValue !== undefined) this.offerValue = updates.offerValue;
  
  // Prices will be recalculated in pre-save middleware
  return this.save();
};

// Static method to get products with price breakdown
productSchema.statics.findWithPricing = function(filter = {}) {
  return this.find(filter).select('+priceBreakdown');
};

module.exports = mongoose.model('Product', productSchema);