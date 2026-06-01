const express = require('express');
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getUserProducts,
  incrementSoldCount,
  incrementSearchCount
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { 
  addProductValidators, 
  updateProductValidators,
  handleValidationErrors 
} = require('../middleware/validationMiddleware');
const router = express.Router();

// Admin routes (Protected by JWT + Admin role check)
router.post('/product', 
  authMiddleware, 
  adminMiddleware,
  addProductValidators,
  handleValidationErrors,
  addProduct
);

router.put('/product/:productId', 
  authMiddleware, 
  adminMiddleware,
  updateProductValidators,
  handleValidationErrors,
  updateProduct
);

router.delete('/product/:productId', 
  authMiddleware, 
  adminMiddleware,
  deleteProduct
);

router.put('/product/sold/:productId', 
  authMiddleware, 
  adminMiddleware,
  incrementSoldCount
);

router.put('/product/search/:productId', 
  authMiddleware, 
  adminMiddleware,
  incrementSearchCount
);

// Public routes
router.get('/products', getProducts);
router.get('/product/:productId', getProductById);

module.exports = router;