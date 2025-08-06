import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Paper, 
  CircularProgress, 
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardMedia,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Fullscreen as FullscreenIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { 
  uploadSingleImage, 
  uploadMultipleImages, 
  deleteImage,
  updateImage 
} from '../../../../user-panel/api/api';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadZone = styled(Paper)(({ theme, isDragActive, isEmpty }) => ({
  position: 'relative',
  minHeight: isEmpty ? 200 : 120,
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive ? theme.palette.primary.light + '10' : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const ImageCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '1',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .image-actions': {
      opacity: 1,
    },
  },
}));

const ImageActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  display: 'flex',
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: 'opacity 0.3s ease',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(4px)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
}));

const EnhancedImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5,
  title = "Product Images",
  required = false,
  accept = "image/*"
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [dragActive, setDragActive] = useState(false);
  const [updatingIndex, setUpdatingIndex] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const updateInputRef = useRef(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    return () => {
      // Cleanup any blob URLs
      images.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const closeAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleFiles = async (files) => {
    if (files.length + images.length > maxImages) {
      showAlert(`Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`, 'warning');
      return;
    }

    // Validate files
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (isValidType && isValidSize) {
        validFiles.push(file);
      } else {
        const reason = !isValidType ? 'invalid type' : 'too large (>10MB)';
        invalidFiles.push(`${file.name} (${reason})`);
      }
    });

    if (invalidFiles.length > 0) {
      showAlert(`Invalid files: ${invalidFiles.join(', ')}`, 'error');
    }

    if (validFiles.length === 0) return;

    await uploadFiles(validFiles);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      let uploadResult;
      
      if (files.length === 1) {
        // Simulate progress for single file
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);
        
        uploadResult = await uploadSingleImage(files[0]);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (uploadResult.success) {
          const newImages = [...images, uploadResult.data.mainImage.url];
          onImagesChange(newImages);
          showAlert('Image uploaded successfully!', 'success');
        }
      } else {
        // Multiple images upload with progress simulation
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 5, 90));
        }, 300);
        
        uploadResult = await uploadMultipleImages(files);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (uploadResult.success) {
          const newImageUrls = uploadResult.data.images.map(item => item.mainImage.url);
          const newImages = [...images, ...newImageUrls];
          onImagesChange(newImages);
          showAlert(`${uploadResult.data.images.length} images uploaded successfully!`, 'success');
        }
      }
      
      if (!uploadResult.success) {
        showAlert(uploadResult.message || 'Upload failed', 'error');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      showAlert('Failed to upload images. Please try again.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleRemoveImage = async (index) => {
    const imageUrl = images[index];
    
    try {
      // Extract filename from URL for deletion
      let fileName = imageUrl;
      if (imageUrl.includes('amazonaws.com')) {
        const urlParts = imageUrl.split('/');
        fileName = urlParts.slice(-2).join('/'); // Get 'products/filename.jpg'
      }
      
      // Delete from S3
      const deleteResult = await deleteImage(fileName);
      
      if (deleteResult.success) {
        // Remove from local state
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
        showAlert('Image deleted successfully!', 'success');
      } else {
        showAlert(deleteResult.message || 'Failed to delete image', 'error');
      }
      
    } catch (error) {
      console.error('Delete error:', error);
      // Still remove from UI even if backend delete fails
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      showAlert('Image removed from list (backend delete may have failed)', 'warning');
    }
  };

  const handleUpdateImage = (index) => {
    setUpdatingIndex(index);
    updateInputRef.current?.click();
  };

  const handleImageUpdate = async (event) => {
    const file = event.target.files[0];
    if (!file || updatingIndex === null) return;

    const isValidType = file.type.startsWith('image/');
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
    
    if (!isValidType || !isValidSize) {
      showAlert('Invalid file. Only images under 10MB allowed.', 'error');
      return;
    }

    setUploading(true);
    
    try {
      const oldImageUrl = images[updatingIndex];
      let oldFileName = oldImageUrl;
      
      if (oldImageUrl.includes('amazonaws.com')) {
        const urlParts = oldImageUrl.split('/');
        oldFileName = urlParts.slice(-2).join('/'); // Get 'products/filename.jpg'
      }
      
      const updateResult = await updateImage(oldFileName, file);
      
      if (updateResult.success) {
        // Update the image URL in the array
        const newImages = [...images];
        newImages[updatingIndex] = updateResult.data.newImage.mainImage.url;
        onImagesChange(newImages);
        showAlert('Image updated successfully!', 'success');
      } else {
        showAlert(updateResult.message || 'Failed to update image', 'error');
      }
      
    } catch (error) {
      console.error('Update error:', error);
      showAlert('Failed to update image. Please try again.', 'error');
    } finally {
      setUploading(false);
      setUpdatingIndex(null);
      // Reset file input
      if (updateInputRef.current) {
        updateInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const openPreview = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const getGridCols = () => {
    if (isMobile) return 2;
    if (isTablet) return 3;
    return maxImages === 1 ? 1 : 4;
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" component="h3">
          {title}
          {required && <Typography component="span" color="error"> *</Typography>}
        </Typography>
        <Chip 
          label={`${images.length}/${maxImages}`}
          color={images.length === maxImages ? "success" : "default"}
          size="small"
        />
      </Box>
      
      {/* Images Grid */}
      <Box 
        display="grid" 
        gridTemplateColumns={`repeat(${getGridCols()}, 1fr)`}
        gap={2} 
        mb={2}
      >
        {images.map((imageUrl, index) => (
          <Zoom in={true} key={index} style={{ transitionDelay: `${index * 100}ms` }}>
            <ImageCard elevation={2}>
              <CardMedia
                component="img"
                image={imageUrl}
                alt={`Product ${index + 1}`}
                sx={{ 
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => openPreview(imageUrl)}
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error('Failed to load image:', imageUrl);
                }}
              />
              <ImageActions className="image-actions">
                <Tooltip title="View full size">
                  <ActionButton
                    size="small"
                    onClick={() => openPreview(imageUrl)}
                  >
                    <FullscreenIcon fontSize="small" />
                  </ActionButton>
                </Tooltip>
                <Tooltip title="Replace image">
                  <ActionButton
                    size="small"
                    onClick={() => handleUpdateImage(index)}
                    disabled={uploading}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </ActionButton>
                </Tooltip>
                <Tooltip title="Delete image">
                  <ActionButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    disabled={uploading}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </ActionButton>
                </Tooltip>
              </ImageActions>
              
              {/* Update indicator */}
              {updatingIndex === index && uploading && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bgcolor="rgba(255,255,255,0.8)"
                  backdropFilter="blur(2px)"
                >
                  <CircularProgress size={30} />
                </Box>
              )}
            </ImageCard>
          </Zoom>
        ))}
        
        {/* Upload Zone */}
        {images.length < maxImages && (
          <Fade in={true}>
            <UploadZone
              elevation={0}
              isDragActive={dragActive}
              isEmpty={images.length === 0}
              onClick={handleClick}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploading ? (
                <Box textAlign="center" p={2}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {updatingIndex !== null ? 'Updating image...' : 'Uploading images...'}
                  </Typography>
                  {uploadProgress > 0 && (
                    <Box mt={2} width="100%">
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress} 
                        sx={{ borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {uploadProgress}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box textAlign="center" p={2}>
                  <CloudUploadIcon 
                    sx={{ 
                      fontSize: images.length === 0 ? 60 : 40, 
                      color: dragActive ? 'primary.main' : 'text.secondary',
                      mb: 1
                    }} 
                  />
                  <Typography 
                    variant={images.length === 0 ? "h6" : "body2"} 
                    color={dragActive ? "primary.main" : "text.secondary"}
                    gutterBottom
                  >
                    {dragActive ? 'Drop images here' : 'Upload Images'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Drag & drop or click to browse
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Max {maxImages} images, up to 10MB each
                  </Typography>
                </Box>
              )}
            </UploadZone>
          </Fade>
        )}
      </Box>

      {/* File inputs */}
      <VisuallyHiddenInput
        ref={fileInputRef}
        type="file"
        multiple={maxImages > 1}
        accept={accept}
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      <VisuallyHiddenInput
        ref={updateInputRef}
        type="file"
        accept={accept}
        onChange={handleImageUpdate}
        disabled={uploading}
      />

      {/* Status indicators */}
      {images.length > 0 && (
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip 
            icon={<CheckIcon />}
            label={`${images.length} image${images.length > 1 ? 's' : ''} uploaded`}
            color="success"
            size="small"
            variant="outlined"
          />
        </Box>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0,0,0,0.9)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
          onClick={closePreview}
          sx={{ cursor: 'pointer' }}
        >
          <Box
            component="img"
            src={previewImage}
            alt="Preview"
            sx={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              bgcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              }
            }}
            onClick={closePreview}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedImageUpload;