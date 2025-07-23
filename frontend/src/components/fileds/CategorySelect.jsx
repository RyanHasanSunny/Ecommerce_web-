import React from 'react';
import { Select, MenuItem } from '@mui/material';

const CategorySelect = ({ categories, categoryId, setCategoryId }) => {
  return (
    <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth>
      <MenuItem value="">Select Category</MenuItem>
      {categories.map((category) => (
        <MenuItem key={category._id} value={category._id}>
          {category.name}
        </MenuItem>
      ))}
    </Select>
  );
};

export default CategorySelect;
