const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { s3, generatePresignedUrl } = require('../config/awsConfig');
const { Upload } = require('@aws-sdk/lib-storage');
const {
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand
} = require('@aws-sdk/client-s3');

// Configure multer for memory storage (we'll process images before uploading)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
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

// Helper function to optimize and upload image to S3
const optimizeAndUploadImage = async (buffer, originalname, folder = 'products') => {
  try {
    // Generate unique filename
    const fileExtension = path.extname(originalname).toLowerCase();
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;
    
    // Optimize image using Sharp
    let optimizedBuffer;
    
    if (fileExtension === '.png') {
      optimizedBuffer = await sharp(buffer)
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
      optimizedBuffer = await sharp(buffer)
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

    // Create thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(300, 300, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 80 
      })
      .toBuffer();

    const thumbnailFileName = `${folder}/thumbnails/${uuidv4()}.jpg`;

    // Upload main image to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: optimizedBuffer,
      ContentType: fileExtension === '.png' ? 'image/png' : 'image/jpeg',
      ACL: 'public-read', // Make images publicly accessible
      Metadata: {
        originalName: originalname,
        uploadedAt: new Date().toISOString()
      }
    };

    const mainUpload = new Upload({
      client: s3,
      params: uploadParams
    });
    const mainImageResult = await mainUpload.done();

    // Upload thumbnail to S3
    const thumbnailParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: thumbnailFileName,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
      Metadata: {
        originalName: `thumb_${originalname}`,
        uploadedAt: new Date().toISOString()
      }
    };

    const thumbnailUpload = new Upload({
      client: s3,
      params: thumbnailParams
    });
    const thumbnailResult = await thumbnailUpload.done();

    return {
      success: true,
      mainImage: {
        fileName: fileName,
        url: mainImageResult.Location,
        size: optimizedBuffer.length
      },
      thumbnail: {
        fileName: thumbnailFileName,
        url: thumbnailResult.Location,
        size: thumbnailBuffer.length
      }
    };

  } catch (error) {
    console.error('Error optimizing and uploading image:', error);
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

    const result = await optimizeAndUploadImage(
      req.file.buffer,
      req.file.originalname,
      'products/single'
    );

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

    const uploadPromises = req.files.map((file, index) => 
      optimizeAndUploadImage(
        file.buffer,
        file.originalname,
        'products/multiple'
      )
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
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
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
        message: 'File name is required'
      });
    }

    // Check if file exists
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName
    });

    try {
      await s3.send(headCommand);
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }
      throw error;
    }

    // Delete the image
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName
    });

    await s3.send(deleteCommand);

    // Also try to delete thumbnail if it exists
    const thumbnailKey = fileName.replace(/^products\//, 'products/thumbnails/').replace(/\.[^/.]+$/, '.jpg');
    try {
      const thumbnailDeleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: thumbnailKey
      });
      await s3.send(thumbnailDeleteCommand);
    } catch (thumbnailError) {
      // Thumbnail deletion failed, but that's okay
      console.log('Thumbnail deletion failed (might not exist):', thumbnailError.message);
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
    const newImageResult = await optimizeAndUploadImage(
      req.file.buffer,
      req.file.originalname,
      'products/updated'
    );

    // Delete old image
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: oldFileName
      });
      await s3.send(deleteCommand);

      // Try to delete old thumbnail
      const oldThumbnailKey = oldFileName.replace(/^products\//, 'products/thumbnails/').replace(/\.[^/.]+$/, '.jpg');
      const thumbnailDeleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: oldThumbnailKey
      });
      await s3.send(thumbnailDeleteCommand);
    } catch (deleteError) {
      console.log('Old image deletion warning:', deleteError.message);
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
    const { prefix = 'products/', maxKeys = 50, continuationToken } = req.query;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: parseInt(maxKeys)
    };

    if (continuationToken) {
      params.ContinuationToken = continuationToken;
    }

    const command = new ListObjectsV2Command(params);
    const result = await s3.send(command);

    const images = result.Contents.map(item => ({
      fileName: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
    }));

    res.status(200).json({
      success: true,
      message: 'Images retrieved successfully',
      data: {
        images: images,
        totalCount: result.KeyCount,
        isTruncated: result.IsTruncated,
        continuationToken: result.NextContinuationToken || null
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

// Get presigned URL for private images
const getPresignedUrl = async (req, res) => {
  try {
    const { fileName } = req.params;
    const { expires = 3600 } = req.query; // Default 1 hour

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'File name is required'
      });
    }

    const presignedUrl = generatePresignedUrl(fileName, parseInt(expires));

    res.status(200).json({
      success: true,
      message: 'Presigned URL generated successfully',
      data: {
        fileName: fileName,
        presignedUrl: presignedUrl,
        expiresIn: parseInt(expires),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get presigned URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate presigned URL',
      error: error.message
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
  getPresignedUrl,
  handleMulterError
};