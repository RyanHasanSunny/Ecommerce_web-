const express = require('express');
const router = express.Router();
const {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  updateImage,
  deleteImage,
  listImages,
  getPresignedUrl,
  handleMulterError
} = require('../controllers/imageUploadController');
const authMiddleware = require('../middleware/authMiddleware');

// Upload single image
router.post('/single', upload.single('image'), uploadSingleImage);

// Upload multiple images (max 10)
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);

// Update/Replace existing image
router.put('/update/:oldFileName', upload.single('image'), updateImage);

// Delete image
router.delete('/:fileName', deleteImage);

// List images with pagination
router.get('/list', listImages);

// Get presigned URL for private images
router.get('/presigned/:fileName', getPresignedUrl);

// Health check for S3 connection
router.get('/health', async (req, res) => {
  try {
    const { testS3Connection } = require('../config/awsConfig');
    const isConnected = await testS3Connection();
    
    res.json({
      success: true,
      s3Connected: isConnected,
      timestamp: new Date().toISOString(),
      bucketName: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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