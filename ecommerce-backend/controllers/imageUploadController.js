const s3 = require('../config/awsConfig');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // npm install uuid

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Limit number of files for multiple upload
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
  }
});

// Generate unique filename to avoid conflicts
const generateFileName = (originalName) => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  return `products/${timestamp}-${uuid}${ext}`;
};

// Upload single image to S3
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    const file = req.file;
    const fileName = generateFileName(file.originalname);
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: 'AES256', // Server-side encryption
      Metadata: {
        'uploaded-by': 'product-service',
        'upload-date': new Date().toISOString()
      }
    };

    // Remove ACL since your bucket policy handles access control
    const result = await s3.upload(params).promise();
    
    res.json({
      success: true,
      imageUrl: result.Location,
      fileName: fileName,
      fileSize: file.size
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Upload multiple images to S3
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No files uploaded' 
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({ 
        success: false,
        error: 'Maximum 10 files allowed per upload' 
      });
    }

    const uploadPromises = req.files.map(file => {
      const fileName = generateFileName(file.originalname);
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256',
        Metadata: {
          'uploaded-by': 'product-service',
          'upload-date': new Date().toISOString(),
          'original-name': file.originalname
        }
      };
      return s3.upload(params).promise();
    });

    const results = await Promise.all(uploadPromises);
    const uploadedFiles = results.map((result, index) => ({
      imageUrl: result.Location,
      fileName: result.Key,
      originalName: req.files[index].originalname,
      fileSize: req.files[index].size
    }));
    
    res.json({
      success: true,
      files: uploadedFiles,
      totalFiles: uploadedFiles.length
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload images',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete image from S3
const deleteImage = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({ 
        success: false,
        error: 'File name is required' 
      });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName
    };

    await s3.deleteObject(params).promise();
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      fileName: fileName
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// List images from S3 bucket
const listImages = async (req, res) => {
  try {
    const { prefix = 'products/', maxKeys = 100 } = req.query;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: parseInt(maxKeys)
    };

    const result = await s3.listObjectsV2(params).promise();
    
    const images = result.Contents.map(item => ({
      fileName: item.Key,
      lastModified: item.LastModified,
      size: item.Size,
      imageUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
    }));
    
    res.json({
      success: true,
      images: images,
      totalCount: result.KeyCount,
      isTruncated: result.IsTruncated
    });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to list images',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message === 'Only image files (jpeg, jpg, png, gif, webp) are allowed!') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  listImages,
  handleMulterError
};