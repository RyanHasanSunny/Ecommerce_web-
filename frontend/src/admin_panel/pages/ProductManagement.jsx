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
  const { productId } = useParams();
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState([]);
  const [specTitle, setSpecTitle] = useState('');
  const [specDetails, setSpecDetails] = useState('');
  const [price, setPrice] = useState('');
  const [profit, setProfit] = useState('');
  const [offerPrice, setOfferPrice] = useState(''); // new state
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(''); // separate field for main image
  const [images, setImages] = useState([]);
  
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(true);

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

    if (productId) {
      const fetchProductDetails = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://18.212.65.1:5000/api/product/${productId}`, {
            headers: { 'x-auth-token': localStorage.getItem('adminToken') }
          });
          const product = response.data;
          setTitle(product.title);
          setCompanyName(product.companyName);
          setDescription(product.description);
          setSpecifications(product.specifications);
          setPrice(product.price);
          setProfit(product.profit);
          setOfferPrice(product.offerPrice || '');
          setCategoryId(product.category?._id || '');
          setThumbnail(product.thumbnail);
          setImages(product.images || []);
        } catch (err) {
          console.error('Error fetching product details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProductDetails();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const handleAddSpecification = () => {
    if (specTitle && specDetails) {
      if (editIndex !== null) {
        const updated = [...specifications];
        updated[editIndex] = { title: specTitle, details: specDetails };
        setSpecifications(updated);
        setEditIndex(null);
      } else {
        setSpecifications([...specifications, { title: specTitle, details: specDetails }]);
      }
      setSpecTitle('');
      setSpecDetails('');
    }
  };

  const handleDeleteSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleAddImage = () => setImages([...images, '']);
  const handleImageChange = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const handleProductSubmit = async () => {
    const sellingPrice = Number(price) + Number(profit);
    try {
      const payload = {
        title,
        companyName,
        description,
        specifications,
        price,
        profit,
        sellingPrice,
        offerPrice: offerPrice || null,
        stock: 0,
        categoryId,
        thumbnail,
        images
      };

      if (productId) {
        await axios.put(
          `http://18.212.65.1:5000/api/product/${productId}`,
          payload,
          { headers: { 'x-auth-token': localStorage.getItem('adminToken') } }
        );
        alert('Product updated successfully');
      } else {
        await axios.post(
          'http://18.212.65.1:5000/api/product',
          payload,
          { headers: { 'x-auth-token': localStorage.getItem('adminToken') } }
        );
        alert('Product added successfully');
      }

      navigate('/admin/products');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <Typography variant="h6">Loading product details...</Typography>;

  return (
    <div className="container" style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5">{productId ? 'Edit Product' : 'Add New Product'}</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <TextField label="Product Title" variant="standard" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
            <Box mt={3}>
              <TextField label="Company Name" variant="standard" fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </Box>

            {/* Thumbnail */}
            <Box mt={3}>
              <TextField label="Thumbnail Image URL" variant="standard" fullWidth value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
            </Box>

            {/* Additional Images */}
            <Box mt={3}>
              <Typography variant="subtitle1">Additional Images</Typography>
              {images.map((img, idx) => (
                <TextField key={idx} label={`Image URL ${idx + 1}`} variant="standard" fullWidth sx={{ my: 1 }} value={img} onChange={(e) => handleImageChange(idx, e.target.value)} />
              ))}
              <Button onClick={handleAddImage} size="small">+ Add Image</Button>
            </Box>

            {/* Description */}
            <Box mt={4}>
              <TextField label="Description" variant="standard" fullWidth multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Box>

            {/* Specifications */}
            <Box mt={4}>
              <Typography variant="h6">Specifications</Typography>
              {specifications.map((spec, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">• <strong>{spec.title}:</strong> {spec.details}</Typography>
                  <IconButton onClick={() => handleDeleteSpecification(index)}><DeleteIcon /></IconButton>
                </Box>
              ))}
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField label="Spec Title" variant="standard" fullWidth value={specTitle} onChange={(e) => setSpecTitle(e.target.value)} /></Grid>
                <Grid item xs={6}><TextField label="Spec Details" variant="standard" fullWidth value={specDetails} onChange={(e) => setSpecDetails(e.target.value)} /></Grid>
              </Grid>
              <IconButton onClick={handleAddSpecification}><AddIcon /></IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box>
              <Typography>Category</Typography>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} variant="standard" fullWidth>
                <MenuItem value="">Select Category</MenuItem>
                {categories.map((cat) => <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>)}
              </Select>
            </Box>

            {/* Pricing */}
            <Box mt={4}>
              <Typography>Pricing</Typography>
              <TextField label="Base Price" type="number" variant="standard" fullWidth value={price} onChange={(e) => setPrice(e.target.value)} />
              <TextField label="Profit" type="number" variant="standard" fullWidth value={profit} onChange={(e) => setProfit(e.target.value)} />
              <TextField label="Offer Price (optional)" type="number" variant="standard" fullWidth value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
              <Divider sx={{ my: 1 }} />
              <Typography>Final Selling Price: <strong>{Number(price) + Number(profit) || 0}</strong></Typography>
            </Box>

            <Box mt={4}>
              <Button variant="contained" fullWidth onClick={handleProductSubmit}>
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
