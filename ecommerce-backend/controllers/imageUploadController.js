const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

// Create upload directories if they don't exist
const uploadDir = path.join(__dirname, '../public/uploads');
const productsDir = path.join(uploadDir, 'products');
const thumbsDir = path.join(productsDir, 'thumbnails');

[uploadDir, productsDir, thumbsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files at once
  },
  fileFilter: fileFilter
});

// Helper function to optimize and save image locally
const optimizeAndSaveImage = async (filePath, originalname) => {
  try {
    const fileExtension = path.extname(originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExtension}`;
    const mainImagePath = path.join(productsDir, fileName);
    
    // Optimize main image
    let optimizedBuffer;
    
    if (fileExtension === '.png') {
      optimizedBuffer = await sharp(filePath)
        .resize(1200, 1200, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .png({ 
          quality: 80, 
          compressionLevel: 8 
        })
        .toBuffer();
    } else {
      optimizedBuffer = await sharp(filePath)
        .resize(1200, 1200, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85, 
          progressive: true 
        })
        .toBuffer();
    }

    // Save optimized main image
    fs.writeFileSync(mainImagePath, optimizedBuffer);

    // Create and save thumbnail
    const thumbnailName = `${uuidv4()}.jpg`;
    const thumbnailPath = path.join(thumbsDir, thumbnailName);
    
    const thumbnailBuffer = await sharp(filePath)
      .resize(300, 300, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 80 
      })
      .toBuffer();
    
    fs.writeFileSync(thumbnailPath, thumbnailBuffer);

    // Generate URLs
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;
    const mainImageUrl = `${baseUrl}/uploads/products/${fileName}`;
    const thumbnailUrl = `${baseUrl}/uploads/products/thumbnails/${thumbnailName}`;

    // Delete original uploaded file
    fs.unlinkSync(filePath);

    return {
      success: true,
      mainImage: {
        fileName: fileName,
        url: mainImageUrl,
        path: mainImagePath,
        size: optimizedBuffer.length
      },
      thumbnail: {
        fileName: thumbnailName,
        url: thumbnailUrl,
        path: thumbnailPath,
        size: thumbnailBuffer.length
      }
    };

  } catch (error) {
    console.error('Error optimizing and saving image:', error);
    throw error;
  }
};

// Upload single image
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const result = await optimizeAndSaveImage(req.file.path, req.file.originalname);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        originalName: req.file.originalname,
        mainImage: result.mainImage,
        thumbnail: result.thumbnail,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Single image upload error:', error);
    // Clean up file if upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 images allowed at once'
      });
    }

    const uploadPromises = req.files.map(file => 
      optimizeAndSaveImage(file.path, file.originalname)
    );

    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.map((result, index) => ({
      originalName: req.files[index].originalname,
      mainImage: result.mainImage,
      thumbnail: result.thumbnail,
      uploadedAt: new Date().toISOString()
    }));

    res.status(200).json({
      success: true,
      message: `${successfulUploads.length} images uploaded successfully`,
      data: {
        images: successfulUploads,
        totalUploaded: successfulUploads.length
      }
    });

  } catch (error) {
    console.error('Multiple images upload error:', error);
    // Clean up files if upload failed
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// Delete image from local storage
const deleteImage = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'File name is required'
      });
    }

    // Sanitize fileName to prevent directory traversal
    const sanitizedFileName = path.basename(fileName);
    const imagePath = path.join(productsDir, sanitizedFileName);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete the image
    fs.unlinkSync(imagePath);

    // Try to delete thumbnail if it exists
    const thumbnailPath = path.join(thumbsDir, `thumb_${sanitizedFileName}`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        deletedFile: fileName,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

// Update/Replace image
const updateImage = async (req, res) => {
  try {
    const { oldFileName } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No new image file provided'
      });
    }

    if (!oldFileName) {
      return res.status(400).json({
        success: false,
        message: 'Old file name is required'
      });
    }

    // Upload new image first
    const newImageResult = await optimizeAndSaveImage(req.file.path, req.file.originalname);

    // Delete old image
    const sanitizedFileName = path.basename(oldFileName);
    const oldImagePath = path.join(productsDir, sanitizedFileName);
    
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }

    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      data: {
        oldFileName: oldFileName,
        newImage: {
          originalName: req.file.originalname,
          mainImage: newImageResult.mainImage,
          thumbnail: newImageResult.thumbnail,
          updatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Update image error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update image',
      error: error.message
    });
  }
};

// List images with pagination
const listImages = async (req, res) => {
  try {
    const { maxKeys = 50 } = req.query;

    // Read files from products directory
    const files = fs.readdirSync(productsDir);
    const imageFiles = files
      .filter(file => /\.(jpeg|jpg|png|gif|webp)$/i.test(file))
      .slice(0, parseInt(maxKeys));

    const images = imageFiles.map(file => {
      const filePath = path.join(productsDir, file);
      const stats = fs.statSync(filePath);
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;
      
      return {
        fileName: file,
        size: stats.size,
        lastModified: stats.mtime,
        url: `${baseUrl}/uploads/products/${file}`
      };
    });

    res.status(200).json({
      success: true,
      message: 'Images retrieved successfully',
      data: {
        images: images,
        totalCount: imageFiles.length,
        isTruncated: imageFiles.length >= parseInt(maxKeys)
      }
    });

  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve images',
      error: error.message
    });
  }
};

// Health check for local storage
const healthCheck = async (req, res) => {
  try {
    const stats = fs.statSync(productsDir);
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;
    
    res.json({
      success: true,
      storage: 'local',
      uploadPath: productsDir,
      accessible: true,
      baseUrl: baseUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Storage health check failed',
      message: error.message
    });
  }
};

// Error handling middleware for Multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload.'
      });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return res.status(500).json({
    success: false,
    message: 'File upload error',
    error: error.message
  });
};

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  updateImage,
  deleteImage,
  listImages,
  healthCheck,
  handleMulterError
};