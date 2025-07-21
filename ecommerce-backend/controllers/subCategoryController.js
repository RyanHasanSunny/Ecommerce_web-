const SubCategory = require('../models/subCategoryModel');

// Add subcategory (Admin only)
exports.addSubCategory = async (req, res) => {
  const { name, description, categoryId } = req.body;

  try {
    const newSubCategory = new SubCategory({ name, description, category: categoryId });
    await newSubCategory.save();
    res.status(201).json(newSubCategory);
  } catch (err) {
    res.status(500).send('Error adding subcategory');
  }
};

// Get subcategories by category ID
exports.getSubCategories = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const subCategories = await SubCategory.find({ category: categoryId });
    res.json(subCategories);
  } catch (err) {
    res.status(500).send('Error fetching subcategories');
  }
};
