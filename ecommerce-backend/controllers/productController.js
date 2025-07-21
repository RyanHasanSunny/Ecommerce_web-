const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');  // Import mongoose


/// Add new product (Admin only)
exports.addProduct = async (req, res) => {
  const { title, companyName, description, specifications, price, stock, categoryId, image } = req.body;

  // Validate categoryId to ensure it's a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ msg: 'Invalid category ID' });
  }

  try {
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ msg: 'Category not found' });

    // Validation for specifications: Ensure it is an array
    if (specifications && !Array.isArray(specifications)) {
      return res.status(400).json({ msg: 'Specifications should be an array of objects' });
    }

    const newProduct = new Product({
      title,
      companyName,
      description,
      specifications,
      price,
      stock,
      category: categoryId,
      image
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all products (For user display)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

/// Increment sold count (Track when a product is sold)
exports.incrementSoldCount = async (req, res) => {
  const { productId } = req.params; // Get the product ID from the URL

  try {
    // Find the product by its ID
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    // Increment the sold count by 1
    product.soldCount += 1;

    // Save the updated product to the database
    await product.save();

    // Respond with the updated sold count
    res.json({ msg: 'Product sold count updated', soldCount: product.soldCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating sold count' });
  }
};

// Increment search count (Track when a product is searched)
exports.incrementSearchCount = async (req, res) => {
  const { productId } = req.params;
  
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product.searchCount += 1;
    await product.save();

    res.json({ msg: 'Product search count updated', searchCount: product.searchCount });
  } catch (err) {
    res.status(500).json({ msg: 'Error updating search count' });
  }
};

// Get feature products (Top-selling and top-searched)
exports.getFeatureProducts = async (req, res) => {
  try {
    const featureProducts = await Product.find().sort({ soldCount: -1, searchCount: -1 }).limit(10);
    res.json(featureProducts);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching feature products' });
  }
};
