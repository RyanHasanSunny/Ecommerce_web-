const express = require('express');
const router = express.Router();
const {
    getHomePage,
    updateHomePage,
    togglePromoEnabled
} = require('../controllers/homepageController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get homepage data
router.get('/homepagedata', getHomePage  );

// Update homepage data
router.post('/homepagedata',  authMiddleware, adminMiddleware, updateHomePage);

// Toggle promo enabled status (Admin only)
router.put('/toggle-promo', authMiddleware, adminMiddleware, togglePromoEnabled);

module.exports = router;
