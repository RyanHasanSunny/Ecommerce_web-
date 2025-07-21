const Category = require('../models/categoryModel');

// Add category (Parent or Child)
exports.addCategory = async (req, res) => {
  const { name, description, isParent, parentCategory } = req.body;

  try {
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
    }

    // Create the new category
    const newCategory = new Category({
      name,
      description,
      isParent,
      parentCategory: isParent ? null : parentCategory  // If parent, set null for parentCategory
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'category already exists' });
  }
};

// Get all categories (With Parent and Child relationship)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};
