import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { getCategories, addCategory } from '../../user-panel/api/api';

// CategoryManagement: Form for adding a new category
const CategoryManagement = ({ onSuccess }) => {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isParent, setIsParent] = useState(true);
  const [parentCategory, setParentCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getCategories();
        // Ensure categories is always an array
        const list = Array.isArray(data) ? data : data.categories;
        setCategories(list || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchAll();
  }, []);

  const handleCategorySubmit = async () => {
    try {
      await addCategory({
        name: categoryName,
        description,
        isParent,
        parentCategory: isParent ? null : parentCategory
      });
      alert('Category added successfully');
      onSuccess();
      // reset form
      setCategoryName('');
      setDescription('');
      setIsParent(true);
      setParentCategory('');
    } catch (err) {
      alert(`Error: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        label="Category Name"
        value={categoryName}
        onChange={e => setCategoryName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={isParent}
            onChange={e => setIsParent(e.target.checked)}
          />
        }
        label="Is Parent Category?"
      />
      {!isParent && (
        <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
          <InputLabel>Parent Category</InputLabel>
          <Select
            value={parentCategory}
            label="Parent Category"
            onChange={e => setParentCategory(e.target.value)}
          >
            {categories.map(cat => (
              <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleCategorySubmit}
          disabled={!categoryName || !description || (!isParent && !parentCategory)}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

// CategoryList: Displays list of categories and handles dialog
const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const list = Array.isArray(data) ? data : data.categories;
      setCategories(list || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    fetchCategories();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Category List</Typography>
        <Button variant="contained" onClick={handleOpen}>Add Category</Button>
      </Box>

      <List>
        {categories.map(cat => (
          <ListItem key={cat._id}>
            <Typography>
              {cat.name} {cat.isParent ? '(Parent)' : `(Child of ${cat.parentCategory?.name || '—'})`}
            </Typography>
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <CategoryManagement onSuccess={handleClose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryList;
