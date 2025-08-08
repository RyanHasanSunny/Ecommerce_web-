const express = require('express');
const router = express.Router();
const {
    getHomePage,
    updateHomePage
} = require('../controllers/homepageController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get homepage data
router.get('/homepagedata', getHomePage  );

// Update homepage data
router.post('/homepagedata',  authMiddleware, adminMiddleware, updateHomePage);

module.exports = router;
