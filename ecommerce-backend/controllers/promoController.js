const PromoCode = require('../models/promoCodeModel');

// Get all promo codes (Admin only)
exports.getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: promoCodes
    });
  } catch (err) {
    console.error('getAllPromoCodes error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get single promo code (Admin only)
exports.getPromoCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const promoCode = await PromoCode.findById(id).populate('createdBy', 'name email');

    if (!promoCode) {
      return res.status(404).json({ msg: 'Promo code not found' });
    }

    res.json({
      success: true,
      data: promoCode
    });
  } catch (err) {
    console.error('getPromoCodeById error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create new promo code (Admin only)
exports.createPromoCode = async (req, res) => {
  try {
    const { code, discountAmount, discountType, expiryDate, usageLimit } = req.body;

    // Validate required fields
    if (!code || !discountAmount || !discountType || !expiryDate) {
      return res.status(400).json({ msg: 'All required fields must be provided' });
    }

    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ msg: 'Promo code already exists' });
    }

    // Validate discount type
    if (!['percent', 'fixed'].includes(discountType)) {
      return res.status(400).json({ msg: 'Invalid discount type. Must be "percent" or "fixed"' });
    }

    // Validate expiry date
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ msg: 'Expiry date must be in the future' });
    }

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      discountAmount,
      discountType,
      expiryDate,
      usageLimit,
      createdBy: req.user.userId
    });

    await promoCode.save();

    res.status(201).json({
      success: true,
      msg: 'Promo code created successfully',
      data: promoCode
    });
  } catch (err) {
    console.error('createPromoCode error:', err);
    if (err.code === 11000) {
      res.status(400).json({ msg: 'Promo code already exists' });
    } else {
      res.status(500).json({ msg: 'Server error' });
    }
  }
};

// Update promo code (Admin only)
exports.updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountAmount, discountType, expiryDate, usageLimit, isEnabled } = req.body;

    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return res.status(404).json({ msg: 'Promo code not found' });
    }

    // Check if new code conflicts with existing ones
    if (code && code.toUpperCase() !== promoCode.code) {
      const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
      if (existingCode) {
        return res.status(400).json({ msg: 'Promo code already exists' });
      }
    }

    // Validate discount type
    if (discountType && !['percent', 'fixed'].includes(discountType)) {
      return res.status(400).json({ msg: 'Invalid discount type. Must be "percent" or "fixed"' });
    }

    // Validate expiry date
    if (expiryDate && new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ msg: 'Expiry date must be in the future' });
    }

    // Update fields
    if (code) promoCode.code = code.toUpperCase();
    if (discountAmount !== undefined) promoCode.discountAmount = discountAmount;
    if (discountType) promoCode.discountType = discountType;
    if (expiryDate) promoCode.expiryDate = expiryDate;
    if (usageLimit !== undefined) promoCode.usageLimit = usageLimit;
    if (isEnabled !== undefined) promoCode.isEnabled = isEnabled;

    await promoCode.save();

    res.json({
      success: true,
      msg: 'Promo code updated successfully',
      data: promoCode
    });
  } catch (err) {
    console.error('updatePromoCode error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete promo code (Admin only)
exports.deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const promoCode = await PromoCode.findByIdAndDelete(id);

    if (!promoCode) {
      return res.status(404).json({ msg: 'Promo code not found' });
    }

    res.json({
      success: true,
      msg: 'Promo code deleted successfully'
    });
  } catch (err) {
    console.error('deletePromoCode error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Toggle promo code enabled status (Admin only)
exports.togglePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const promoCode = await PromoCode.findById(id);

    if (!promoCode) {
      return res.status(404).json({ msg: 'Promo code not found' });
    }

    promoCode.isEnabled = !promoCode.isEnabled;
    await promoCode.save();

    res.json({
      success: true,
      msg: `Promo code ${promoCode.isEnabled ? 'enabled' : 'disabled'} successfully`,
      data: promoCode
    });
  } catch (err) {
    console.error('togglePromoCode error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
