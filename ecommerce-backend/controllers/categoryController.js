const Category = require('../models/categoryModel');

// @route   POST /api/category
// @desc    Add category (Parent or Child)
// @access  Private (Admin only)
exports.addCategory = async (req, res) => {
  const { name, description, isParent, parentCategory } = req.body;

  try {
    // Validation
    if (!name || !description) {
      return res.status(400).json({ msg: 'Name and description are required' });
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ msg: 'Category name already exists' });
    }

    // If the category is a child category, ensure that parentCategory is provided
    if (isParent === false && !parentCategory) {
      return res.status(400).json({ msg: 'Parent category is required for a child category' });
    }

    // If the category is a child, make sure the parent exists
    if (isParent === false) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ msg: 'The provided parent category does not exist' });
      }

      // Make sure parent is actually a parent category
      if (!parent.isParent) {
        return res.status(400).json({ msg: 'The selected parent category is not a parent category' });
      }
    }

    // Create the new category
    const newCategory = new Category({
      name: name.trim(),
      description: description.trim(),
      isParent,
      parentCategory: isParent ? null : parentCategory  // If parent, set null for parentCategory
    });
    
    await newCategory.save();
    
    // Populate parent category info in response
    await newCategory.populate('parentCategory', 'name');
    
    res.status(201).json({
      success: true,
      msg: 'Category created successfully',
      category: newCategory
    });
  } catch (err) {
    console.error('Add category error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Category name already exists' });
    }
    res.status(500).json({ msg: 'Server error while creating category' });
  }
};

// @route   GET /api/categories
// @desc    Get all categories (With Parent and Child relationship)
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const { includeChildren = 'true', parentOnly = 'false' } = req.query;
    
    let query = {};
    
    // If parentOnly is true, only get parent categories
    if (parentOnly === 'true') {
      query.isParent = true;
    }
    
    const categories = await Category.find(query)
      .populate('parentCategory', 'name description')
      .sort({ isParent: -1, name: 1 }); // Parents first, then alphabetical

    // If includeChildren is false, filter out children
    const filteredCategories = includeChildren === 'false' 
      ? categories.filter(cat => cat.isParent) 
      : categories;

    res.json({
      success: true,
      count: filteredCategories.length,
      categories: filteredCategories
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ msg: 'Server error while fetching categories' });
  }
};

// @route   GET /api/category/:id
// @desc    Get single category by ID
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name description');
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Get children categories if this is a parent
    let children = [];
    if (category.isParent) {
      children = await Category.find({ parentCategory: category._id })
        .select('name description');
    }

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        children
      }
    });
  } catch (err) {
    console.error('Get category by ID error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).json({ msg: 'Server error while fetching category' });
  }
};

// @route   PUT /api/category/:id
// @desc    Update category
// @access  Private (Admin only)
exports.updateCategory = async (req, res) => {
  const { name, description, isParent, parentCategory } = req.body;

  try {
    // Find the category to update
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Validation
    if (!name || !description) {
      return res.status(400).json({ msg: 'Name and description are required' });
    }

    // Check if new name conflicts with existing categories (excluding current one)
    if (name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({ msg: 'Category name already exists' });
      }
    }

    // If changing to child category, validate parent
    if (isParent === false && !parentCategory) {
      return res.status(400).json({ msg: 'Parent category is required for a child category' });
    }

    if (isParent === false && parentCategory) {
      // Can't set self as parent
      if (parentCategory === req.params.id) {
        return res.status(400).json({ msg: 'Category cannot be its own parent' });
      }

      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ msg: 'The provided parent category does not exist' });
      }

      if (!parent.isParent) {
        return res.status(400).json({ msg: 'The selected parent category is not a parent category' });
      }
    }

    // If changing from parent to child, check if it has children
    if (category.isParent && isParent === false) {
      const childrenCount = await Category.countDocuments({ parentCategory: category._id });
      if (childrenCount > 0) {
        return res.status(400).json({ 
          msg: `Cannot convert to child category. This category has ${childrenCount} child categories.` 
        });
      }
    }

    // Update fields
    category.name = name.trim();
    category.description = description.trim();
    category.isParent = isParent;
    category.parentCategory = isParent ? null : parentCategory;

    await category.save();
    await category.populate('parentCategory', 'name');

    res.json({
      success: true,
      msg: 'Category updated successfully',
      category
    });
  } catch (err) {
    console.error('Update category error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Category name already exists' });
    }
    res.status(500).json({ msg: 'Server error while updating category' });
  }
};

// @route   DELETE /api/category/:id
// @desc    Delete category
// @access  Private (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Check if category has children
    if (category.isParent) {
      const childrenCount = await Category.countDocuments({ parentCategory: category._id });
      if (childrenCount > 0) {
        return res.status(400).json({ 
          msg: `Cannot delete category. It has ${childrenCount} child categories. Please delete or reassign child categories first.` 
        });
      }
    }

    // Check if category is used by products
    const Product = require('../models/productModel');
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        msg: `Cannot delete category. It is used by ${productsCount} products. Please reassign products to other categories first.` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: 'Category deleted successfully',
      deletedCategory: {
        id: category._id,
        name: category.name
      }
    });
  } catch (err) {
    console.error('Delete category error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).json({ msg: 'Server error while deleting category' });
  }
};

// @route   GET /api/categories/hierarchy
// @desc    Get categories in hierarchical structure
// @access  Public
exports.getCategoryHierarchy = async (req, res) => {
  try {
    // Get all parent categories
    const parentCategories = await Category.find({ isParent: true })
      .sort({ name: 1 })
      .lean();

    // Get all child categories
    const childCategories = await Category.find({ isParent: false })
      .populate('parentCategory', 'name')
      .sort({ name: 1 })
      .lean();

    // Build hierarchy
    const hierarchy = parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => 
        child.parentCategory && child.parentCategory._id.toString() === parent._id.toString()
      )
    }));

    res.json({
      success: true,
      hierarchy
    });
  } catch (err) {
    console.error('Get category hierarchy error:', err);
    res.status(500).json({ msg: 'Server error while fetching category hierarchy' });
  }
};

// @route   GET /api/categories/stats
// @desc    Get category statistics
// @access  Private (Admin only)
exports.getCategoryStats = async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments();
    const parentCategories = await Category.countDocuments({ isParent: true });
    const childCategories = await Category.countDocuments({ isParent: false });

    // Get product count per category
    const Product = require('../models/productModel');
    const categoryProductCounts = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          categoryName: '$category.name',
          productCount: 1
        }
      },
      {
        $sort: { productCount: -1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalCategories,
        parentCategories,
        childCategories,
        categoryProductCounts
      }
    });
  } catch (err) {
    console.error('Get category stats error:', err);
    res.status(500).json({ msg: 'Server error while fetching category statistics' });
  }
};