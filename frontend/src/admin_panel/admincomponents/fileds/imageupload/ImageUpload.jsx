import React from 'react';
import { Box, Typography } from '@mui/material';

const ImageUpload = ({ imageFiles, handleImageUpload }) => {
  return (
    <div>
      <Typography variant="h6">Product Images</Typography>
      <input type="file" multiple onChange={handleImageUpload} />
      <Box display="flex" flexDirection="row" mt={2}>
        {imageFiles.map((file, index) => (
          <Box key={index} sx={{ marginRight: '10px', border: '1px solid #ccc', padding: '10px' }}>
            <img src={URL.createObjectURL(file)} alt="preview" width="100" height="100" />
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default ImageUpload;
