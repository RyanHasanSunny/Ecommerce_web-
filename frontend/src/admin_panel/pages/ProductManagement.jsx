import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Typography, Select, MenuItem,
  Grid, IconButton, Box, Divider, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ProductManagement = () => {
  const { productId } = useParams(); // Get the productId from the URL
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');  // Added companyName state
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState([]);
  const [specTitle, setSpecTitle] = useState('');
  const [specDetails, setSpecDetails] = useState('');
  const [price, setPrice] = useState('');
  const [profit, setProfit] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(['']); // Multiple image URLs

  const [editIndex, setEditIndex] = useState(null); // To track which specification is being edited
  const [loading, setLoading] = useState(true); // Loading state for API call

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://18.212.65.1:5000/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();

    // Fetch product details only if there's a productId (for editing)
    if (productId) {
      const fetchProductDetails = async () => {
        setLoading(true); // Set loading state to true while fetching
        try {
          const response = await axios.get(`http://18.212.65.1:5000/api/product/${productId}`, {
            headers: { 'x-auth-token': localStorage.getItem('adminToken') }
          });
          const product = response.data;
          setTitle(product.title);
          setCompanyName(product.companyName);  // Set companyName
          setDescription(product.description);
          setSpecifications(product.specifications);
          setPrice(product.price);
          setProfit(product.profit);
          setCategoryId(product.categoryId);
          setImages([product.image]);
          setLoading(false); // Set loading state to false after data is fetched
        } catch (err) {
          console.error('Error fetching product details:', err);
          setLoading(false); // Set loading state to false in case of error
        }
      };

      fetchProductDetails();
    } else {
      setLoading(false); // If no productId, stop loading immediately
    }
  }, [productId]); // Re-fetch if the productId changes

  const handleAddSpecification = () => {
    if (specTitle && specDetails) {
      if (editIndex !== null) {
        const updatedSpecifications = [...specifications];
        updatedSpecifications[editIndex] = { title: specTitle, details: specDetails };
        setSpecifications(updatedSpecifications);
        setEditIndex(null); // Reset edit mode
      } else {
        setSpecifications([...specifications, { title: specTitle, details: specDetails }]);
      }
      setSpecTitle('');
      setSpecDetails('');
    }
  };

  const handleEditSpecification = (index) => {
    const spec = specifications[index];
    setSpecTitle(spec.title);
    setSpecDetails(spec.details);
    setEditIndex(index); // Set the index of the specification being edited
  };

  const handleDeleteSpecification = (index) => {
    const updatedSpecifications = specifications.filter((_, i) => i !== index); // Remove specification by index
    setSpecifications(updatedSpecifications);
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
      if (productId) {
        await axios.put(
          `http://18.212.65.1:5000/api/product/${productId}`,
          {
            title,
            companyName,  // Include company name
            description,
            specifications,
            price,
            profit,
            categoryId,
            image: images.filter(img => img)[0] || '',
            finalPrice: finalPrice
          },
          { headers: { 'x-auth-token': localStorage.getItem('adminToken') } }
        );
        alert('Product updated successfully');
        navigate('/admin/products'); // Navigate to product list after updating
      } else {
        await axios.post(
          'http://18.212.65.1:5000/api/product',
          {
            title,
            companyName,  // Include company name
            description,
            specifications,
            price,
            profit,
            stock: 0,
            categoryId,
            image: images.filter(img => img)[0] || '',
            finalPrice: finalPrice
          },
          { headers: { 'x-auth-token': localStorage.getItem('adminToken') } }
        );
        alert('Product added successfully');
        navigate('/admin/products'); // Navigate to product list after adding
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <Typography variant="h6">Loading product details...</Typography>; // Show loading state
  }

  return (
    <div className="container" style={{ maxHeight: 'calc(100vh - 140px)', height: '100%', overflowY: 'auto' }}>
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {productId ? 'Edit Product' : 'Add New Product'}
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

            {/* Company Name Field */}
            <Box mt={3}>
              <TextField
                label="Company Name"
                variant="standard"
                fullWidth
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </Box>

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
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • <strong>{spec.title}:</strong> {spec.details}
                  </Typography>
                  <div>
                    <Button onClick={() => handleEditSpecification(index)} color="primary" size="small">Edit</Button>
                    <IconButton onClick={() => handleDeleteSpecification(index)} color="secondary" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Box>
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
                {productId ? 'Update Product' : 'Submit Product'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default ProductManagement;
