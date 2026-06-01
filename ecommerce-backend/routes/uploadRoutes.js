const express = require('express');
const router = express.Router();
const {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  updateImage,
  deleteImage,
  listImages,
  healthCheck,
  handleMulterError
} = require('../controllers/imageUploadController');
const authMiddleware = require('../middleware/authMiddleware');

// Upload single image
router.post('/single', upload.single('image'), authMiddleware, uploadSingleImage);

// Upload multiple images (max 10)
router.post('/multiple', upload.array('images', 10), authMiddleware, uploadMultipleImages);

// Update/Replace existing image
router.put('/update/:oldFileName', upload.single('image'), authMiddleware, updateImage);

// Delete image
router.delete('/:fileName', authMiddleware, deleteImage);

// List images with pagination
router.get('/list', listImages);

// Health check for local storage
router.get('/health', healthCheck);

// Test upload endpoint (for development/testing)
router.post('/test', upload.single('testImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No test image provided'
    });
  }

  res.json({
    success: true,
    message: 'Test upload received successfully',
    fileInfo: {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
});

// Error handling middleware - should be last
router.use(handleMulterError);

module.exports = router;