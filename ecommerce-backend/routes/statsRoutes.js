
const express = require('express');
const Product = require('../models/productModel'); // Your Product model
const router = express.Router();

// Get total products, total sold, total searches
router.get('/stats', async (req, res) => {
  try {
    // Total number of products
    const totalProducts = await Product.countDocuments();

    // Total sold items (assuming you have a soldCount field in your Product model)
    const totalSold = await Product.aggregate([
      { $group: { _id: null, total: { $sum: "$soldCount" } } }
    ]);

    // Total searches (assuming you have a searchCount field in your Product model)
    const totalSearches = await Product.aggregate([
      { $group: { _id: null, total: { $sum: "$searchCount" } } }
    ]);

    // Send the response with the statistics
    res.json({
      totalProducts,
      totalSold: totalSold[0]?.total || 0, // Safely check for total sold
      totalSearches: totalSearches[0]?.total || 0 // Safely check for total searches
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
