const express = require('express');
const router = express.Router();
const {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  listImages,
  handleMulterError
} = require('../controllers/imageUploadController');

// Upload single image
router.post('/', upload.single('image'), uploadSingleImage);

// Upload multiple images (max 10)
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);

// Delete image
router.delete('/:fileName', deleteImage);

// List images
router.get('/list', listImages);

// Health check for S3 connection
router.get('/health', async (req, res) => {
  try {
    const { testS3Connection } = require('../config/awsConfig');
    const isConnected = await testS3Connection();
    
    res.json({
      success: true,
      s3Connected: isConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware - should be last
router.use(handleMulterError);

module.exports = router;