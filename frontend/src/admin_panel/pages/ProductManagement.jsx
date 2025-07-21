import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Select, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // + Icon for adding specifications

const ProductManagement = () => {
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState([]); // Array of specifications
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [categories, setCategories] = useState([]); // State for categories
  const [specTitle, setSpecTitle] = useState(''); // Title of specification
  const [specDetails, setSpecDetails] = useState(''); // Details of specification

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');  // Endpoint to fetch categories
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Handle adding specifications
  const handleAddSpecification = () => {
    if (specTitle && specDetails) {
      setSpecifications([...specifications, { title: specTitle, details: specDetails }]);
      setSpecTitle(''); // Reset spec title input
      setSpecDetails(''); // Reset spec details input
    } else {
      alert('Both title and details are required for a specification.');
    }
  };

  // Handle product submission
  const handleProductSubmit = async () => {
    if (!categoryId) {
      alert('Please select a category');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/product',
        { title, companyName, description, specifications, price, stock, categoryId, image },
        { headers: { 'x-auth-token': localStorage.getItem('adminToken') } }
      );
      alert('Product added successfully');
    } catch (err) {
      alert(`Error adding product: ${err.message}`);
    }
  };

  return (
    <div>
      <Typography variant="h4">Add Product</Typography>
      <TextField label="Product Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
      <TextField label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} fullWidth />
      <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
      <TextField label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} fullWidth />
      <TextField label="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} fullWidth />
      
      {/* Specifications Part */}
      <Typography variant="h6">Specifications</Typography>
      {specifications.map((spec, index) => (
        <div key={index}>
          <Typography variant="body2">{spec.title}: {spec.details}</Typography>
        </div>
      ))}
      <TextField 
        label="Specification Title" 
        value={specTitle} 
        onChange={(e) => setSpecTitle(e.target.value)} 
        fullWidth 
      />
      <TextField 
        label="Specification Details" 
        value={specDetails} 
        onChange={(e) => setSpecDetails(e.target.value)} 
        fullWidth 
      />
      <IconButton color="primary" onClick={handleAddSpecification}>
        <AddIcon /> {/* "+" icon */}
      </IconButton>

      {/* Category Dropdown */}
      <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth>
        <MenuItem value="">Select Category</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category._id} value={category._id}>
            {category.name}
          </MenuItem>
        ))}
      </Select>

      <TextField label="Image URL" value={image} onChange={(e) => setImage(e.target.value)} fullWidth />
      <Button variant="contained" onClick={handleProductSubmit}>Add Product</Button>
    </div>
  );
};

export default ProductManagement;
