import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Typography, Select, MenuItem,
  Grid, IconButton, Box, Divider, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const ProductManagement = () => {
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState([]);
  const [specTitle, setSpecTitle] = useState('');
  const [specDetails, setSpecDetails] = useState('');
  const [price, setPrice] = useState('');
  const [profit, setProfit] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(['']); // Multiple image URLs

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleAddSpecification = () => {
    if (specTitle && specDetails) {
      setSpecifications([...specifications, { title: specTitle, details: specDetails }]);
      setSpecTitle('');
      setSpecDetails('');
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleAddImage = () => {
    setImages([...images, '']);
  };

  const handleProductSubmit = async () => {
    const finalPrice = Number(price) + Number(profit);
    try {
      await axios.post(
        'http://localhost:5000/api/product',
        {
          title,
          companyName,
          description,
          specifications,
          price: finalPrice,
          stock: 0,
          categoryId,
          image: images.filter(img => img)[0] || ''
        },
        { headers: { 'x-auth-token': localStorage.getItem('adminToken') } }
      );
      alert('Product added successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="container" >
    <Paper sx={{ p: 4, mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add New Product
      </Typography>
      <Grid container spacing={4}>
        {/* LEFT SIDE */}
        <Grid item xs={12} md={7}>
          <TextField
            label="Product Title"
            variant="standard"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Box mt={3}>
            <Typography variant="subtitle1">Product Images</Typography>
            {images.map((img, idx) => (
              <TextField
                key={idx}
                label={`Image URL ${idx + 1}`}
                variant="standard"
                fullWidth
                sx={{ my: 1 }}
                value={img}
                onChange={(e) => handleImageChange(idx, e.target.value)}
              />
            ))}
            <Button onClick={handleAddImage} size="small">+ Add Image</Button>
          </Box>

          <Box mt={4}>
            <TextField
              label="Description"
              variant="standard"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>

          <Box mt={4}>
            <Typography variant="h6">Specifications</Typography>
            {specifications.map((spec, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                • <strong>{spec.title}:</strong> {spec.details}
              </Typography>
            ))}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Specification Title"
                  variant="standard"
                  fullWidth
                  value={specTitle}
                  onChange={(e) => setSpecTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Specification Details"
                  variant="standard"
                  fullWidth
                  value={specDetails}
                  onChange={(e) => setSpecDetails(e.target.value)}
                />
              </Grid>
            </Grid>
            <IconButton onClick={handleAddSpecification} color="primary" sx={{ mt: 1 }}>
              <AddIcon />
            </IconButton>
          </Box>
        </Grid>

        {/* RIGHT SIDE */}
        <Grid item xs={12} md={5}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Category</Typography>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              variant="standard"
              fullWidth
            >
              <MenuItem value="">Select Category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box mt={4}>
            <Typography variant="subtitle1" gutterBottom>Pricing</Typography>
            <TextField
              label="Product Price"
              variant="standard"
              fullWidth
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Profit"
              variant="standard"
              fullWidth
              type="number"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1">
              Final Price: <strong>{Number(price) + Number(profit) || 0}</strong>
            </Typography>
          </Box>

          <Box mt={4}>
            <Button variant="contained" color="primary" fullWidth onClick={handleProductSubmit}>
              Submit Product
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
    </div>
  );
};

export default ProductManagement;
