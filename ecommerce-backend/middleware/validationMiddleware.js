const { body, query, param, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      msg: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Password strength validator
const isStrongPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false; // At least one uppercase
  if (!/[a-z]/.test(password)) return false; // At least one lowercase
  if (!/[0-9]/.test(password)) return false; // At least one number
  if (!/[!@#$%^&*]/.test(password)) return false; // At least one special char
  return true;
};

// Auth validators
const registerValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .custom(isStrongPassword).withMessage('Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)')
];

const loginValidators = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const passwordUpdateValidators = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .custom(isStrongPassword).withMessage('New password must contain uppercase, lowercase, number, and special character (!@#$%^&*)')
];

const addressValidators = [
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5, max: 500 }).withMessage('Address must be 5-500 characters')
];

// Product validators
const addProductValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Product title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sellingPrice')
    .notEmpty().withMessage('Selling price is required')
    .isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  body('categoryId')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  body('description')
    .trim()
    .optional()
    .isLength({ max: 5000 }).withMessage('Description too long')
];

const updateProductValidators = [
  param('productId')
    .isMongoId().withMessage('Invalid product ID'),
  body('title')
    .trim()
    .optional()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a positive integer')
];

// Category validators
const categoryValidators = [
  body('categoryName')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be 2-100 characters')
];

// Order validators
const createOrderValidators = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.productId')
    .isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress')
    .trim()
    .notEmpty().withMessage('Delivery address is required'),
  body('paymentMethod')
    .trim()
    .notEmpty().withMessage('Payment method is required')
    .isIn(['card', 'upi', 'cod']).withMessage('Invalid payment method')
];

// ID validators
const mongoIdValidator = (paramName) => [
  param(paramName)
    .isMongoId().withMessage(`Invalid ${paramName}`)
];

module.exports = {
  handleValidationErrors,
  registerValidators,
  loginValidators,
  passwordUpdateValidators,
  addressValidators,
  addProductValidators,
  updateProductValidators,
  categoryValidators,
  createOrderValidators,
  mongoIdValidator,
  isStrongPassword
};
