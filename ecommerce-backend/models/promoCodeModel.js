const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percent', 'fixed'],
    default: 'percent'
  },
  isEnabled: {
    type: Boolean,
    required: true,
    default: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    min: 1,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ isEnabled: 1, expiryDate: 1 });

module.exports = mongoose.model('PromoCode', promoCodeSchema);
