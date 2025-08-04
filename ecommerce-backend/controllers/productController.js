const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const s3 = require('../config/awsConfig');

// Helper function to generate product ID
const generateProductId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const lastProduct = await Product.findOne({ productId: new RegExp(`^${year}${month}`) })
                                    .sort({ productId: -1 })
                                    .limit(1);

  const lastNumber = lastProduct ? parseInt(lastProduct.productId.slice(-3)) : 0;
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');

  return `${year}${month}${newNumber}`;
};

<<<<<<< HEAD
// Upload multiple files to S3
const uploadFilesToS3 = async (files) => {
  const uploadPromises = files.map(file => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };
    return s3.upload(params).promise();
  });
=======
// Add product (Admin only)
exports.addProduct = async (req, res) => {
  const { title, companyName, description, specifications, price, profit, stock, categoryId, image } = req.body;
>>>>>>> parent of f742eb4 (Refactor product model and UI for new pricing and images)

  return Promise.all(uploadPromises);
};

// Add product (Admin only)
const addProduct = async (req, res) => {
  try {
    const { title, companyName, description, specifications, price, profit, stock, categoryId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ msg: 'Category not found' });

    // Upload images if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadResults = await uploadFilesToS3(req.files);
      imageUrls = uploadResults.map(result => result.Location);
    }

    const productId = await generateProductId();

    // Convert to numbers and calculate finalPrice
    const numericPrice = parseFloat(price) || 0;
    const numericProfit = parseFloat(profit) || 0;
    const finalPrice = numericPrice + numericProfit;

<<<<<<< HEAD
=======
    // Validate that price and profit are valid numbers
>>>>>>> parent of f742eb4 (Refactor product model and UI for new pricing and images)
    if (isNaN(numericPrice) || isNaN(numericProfit)) {
      return res.status(400).json({ msg: 'Invalid price or profit value' });
    }

    const newProduct = new Product({
      productId,
      title,
      companyName,
      description,
      specifications,
      price: numericPrice,
      profit: numericProfit,
      stock: parseInt(stock) || 0,
      category: categoryId,
<<<<<<< HEAD
      images: imageUrls,
      finalPrice,
=======
      image,
      finalPrice
>>>>>>> parent of f742eb4 (Refactor product model and UI for new pricing and images)
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

<<<<<<< HEAD
// Update product (Admin only)
const updateProduct = async (req, res) => {
=======
// Get all products (For user display)
exports.getProducts = async (req, res) => {
>>>>>>> parent of f742eb4 (Refactor product model and UI for new pricing and images)
  try {
    const { productId } = req.params;
    const { title, companyName, description, specifications, price, profit, stock, categoryId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ msg: 'Category not found' });

    // Upload images if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadResults = await uploadFilesToS3(req.files);
      imageUrls = uploadResults.map(result => result.Location);
    }

    const numericPrice = parseFloat(price) || 0;
    const numericProfit = parseFloat(profit) || 0;
    const finalPrice = numericPrice + numericProfit;

    if (isNaN(numericPrice) || isNaN(numericProfit)) {
      return res.status(400).json({ msg: 'Invalid price or profit value' });
    }

    const updateData = {
      title,
      companyName,
      description,
      specifications,
      price: numericPrice,
      profit: numericProfit,
      stock: parseInt(stock) || 0,
      category: categoryId,
      finalPrice,
    };

    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    if (!updatedProduct) return res.status(404).json({ msg: 'Product not found' });

    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate('category', 'name');
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

<<<<<<< HEAD
const incrementSoldCount = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndUpdate(productId, { $inc: { soldCount: 1 } }, { new: true });
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
=======
// Update product (Admin only)
exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { title, companyName, description, specifications, price, profit, stock, categoryId, image } = req.body;

  try {
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ msg: 'Category not found' });

    // Convert to numbers and calculate finalPrice
    const numericPrice = parseFloat(price) || 0;
    const numericProfit = parseFloat(profit) || 0;
    const finalPrice = numericPrice + numericProfit;

    // Validate that price and profit are valid numbers
    if (isNaN(numericPrice) || isNaN(numericProfit)) {
      return res.status(400).json({ msg: 'Invalid price or profit value' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        title,
        companyName,
        description,
        specifications,
        price: numericPrice,
        profit: numericProfit,
        stock: parseInt(stock) || 0,
        category: categoryId,
        image,
        finalPrice
      },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ msg: 'Product not found' });

    res.json(updatedProduct);
>>>>>>> parent of f742eb4 (Refactor product model and UI for new pricing and images)
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

<<<<<<< HEAD
const incrementSearchCount = async (req, res) => {
=======
// Increment sold count
exports.incrementSoldCount = async (req, res) => {
  const { productId } = req.params;
>>>>>>> parent of f742eb4 (Refactor product model and UI for new pricing and images)
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndUpdate(productId, { $inc: { searchCount: 1 } }, { new: true });
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId }).populate('category', 'name');
    if (products.length === 0) return res.status(404).json({ msg: 'No products found in this category' });
    res.json(products); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ soldCount: -1 }).limit(10);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getMostSearchedProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ searchCount: -1 }).limit(10);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getProductCountByCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    const productCounts = await Promise.all(categories.map(async (category) => {
      const count = await Product.countDocuments({ category: category._id });
      return { category: category.name, count };
    }));
    res.json(productCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  incrementSoldCount,
  incrementSearchCount,
  deleteProduct,
  getProductsByCategory,
  getTopSellingProducts,
  getMostSearchedProducts,
  getProductCount,
  getProductCountByCategory
};