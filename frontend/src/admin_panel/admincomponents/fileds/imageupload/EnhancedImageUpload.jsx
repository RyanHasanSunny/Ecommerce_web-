import React, { useState, useRef } from 'react';
import { Box, Typography, Button, IconButton, Paper, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { styled } from '@mui/material/styles';

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

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 120,
  height: 120,
  border: '2px dashed #ccc',
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const EnhancedImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5,
  title = "Product Images"
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length + images.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      const response = await fetch('http://localhost:8080/api/upload/multiple', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        const uploadedUrls = data.files ? data.files.map(file => file.imageUrl) : data.imageUrls || [];
        const newImages = [...images, ...uploadedUrls];
        onImagesChange(newImages);
        
        // Create preview URLs for local display
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    
    onImagesChange(newImages);
    setPreviewImages(newPreviews);
    
    // Clean up preview URLs
    previewImages.forEach(url => URL.revokeObjectURL(url));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        {images.map((imageUrl, index) => (
          <Box key={index} position="relative">
            <Paper elevation={2} sx={{ p: 1 }}>
              <img 
                src={imageUrl} 
                alt={`Product ${index + 1}`} 
                style={{ 
                  width: 120, 
                  height: 120, 
                  objectFit: 'cover',
                  borderRadius: 4
                }} 
              />
              <IconButton
                size="small"
                onClick={() => handleRemoveImage(index)}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'error.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'error.dark' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          </Box>
        ))}
        
        {images.length < maxImages && (
          <ImagePreview onClick={handleClick}>
            {uploading ? (
              <CircularProgress size={30} />
            ) : (
              <Box textAlign="center">
                <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="caption" display="block">
                  Upload Image
                </Typography>
              </Box>
            )}
          </ImagePreview>
        )}
      </Box>

      <VisuallyHiddenInput
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
      />

      <Typography variant="caption" color="text.secondary">
        {images.length} / {maxImages} images uploaded
      </Typography>
    </Box>
  );
};

export default EnhancedImageUpload;
