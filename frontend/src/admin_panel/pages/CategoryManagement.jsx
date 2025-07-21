import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography } from '@mui/material';

const CategoryManagement = () => {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isParent, setIsParent] = useState(true);
  const [parentCategory, setParentCategory] = useState('');

  const handleCategorySubmit = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/category',
        { name: categoryName, description, isParent, parentCategory },
        { headers: { 'x-auth-token': localStorage.getItem('adminToken') } }
      );
      alert('Category added successfully');
    } catch (err) {
      alert(`Error adding category: ${err.message}`);
    }
  };

  return (
    <div>
      <Typography variant="h4">Add Category</Typography>
      <TextField label="Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} fullWidth />
      <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
      <TextField label="Is Parent Category?" value={isParent} onChange={(e) => setIsParent(e.target.value)} fullWidth />
      {!isParent && <TextField label="Parent Category ID" value={parentCategory} onChange={(e) => setParentCategory(e.target.value)} fullWidth />}
      <Button variant="contained" onClick={handleCategorySubmit}>Add Category</Button>
    </div>
  );
};

export default CategoryManagement;
