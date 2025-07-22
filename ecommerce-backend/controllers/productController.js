const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');  // Import mongoose


// Helper function to generate product ID
const generateProductId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);  // Get last 2 digits of the year
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');  // Get month (2 digits)

  // Get the highest product ID for the current year and month
  const lastProduct = await Product.findOne({ productId: new RegExp(`^${year}${month}`) })
                                    .sort({ productId: -1 })
                                    .limit(1);

  const lastNumber = lastProduct ? parseInt(lastProduct.productId.slice(-3)) : 0;
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');  // Increment and pad to 3 digits

  return `${year}${month}${newNumber}`;
};

// Add product (Admin only)
exports.addProduct = async (req, res) => {
  const { title, companyName, description, specifications, price, stock, categoryId, image } = req.body;

  try {
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ msg: 'Category not found' });

    // Generate product ID
    const productId = await generateProductId();

    const newProduct = new Product({
      productId,  // Add generated productId
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
