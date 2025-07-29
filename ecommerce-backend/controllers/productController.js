const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

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

// Add product (Admin only)
exports.addProduct = async (req, res) => {
  const { title, companyName, description, specifications, price, profit, stock, categoryId, image } = req.body;

  try {
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ msg: 'Category not found' });

    const productId = await generateProductId();

    // Convert to numbers and calculate finalPrice
    const numericPrice = parseFloat(price) || 0;
    const numericProfit = parseFloat(profit) || 0;
    const finalPrice = numericPrice + numericProfit;

    // Validate that price and profit are valid numbers
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
      image,
      finalPrice
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

// Get product by ID (For individual product update)
exports.getProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId).populate('category');
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Increment sold count
exports.incrementSoldCount = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product.soldCount += 1;
    await product.save();

    res.json({ msg: 'Product sold count updated', soldCount: product.soldCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating sold count' });
  }
};

// Increment search count
exports.incrementSearchCount = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product.searchCount += 1;
    await product.save();

    res.json({ msg: 'Product search count updated', searchCount: product.searchCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating search count' });
  }
};