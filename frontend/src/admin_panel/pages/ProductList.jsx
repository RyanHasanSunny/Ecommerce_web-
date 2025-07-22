import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, TextField, Grid, Autocomplete
} from '@mui/material';

const ProductList = () => {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch products (with category populated)
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:5000/api/products',
        { headers: { 'x-auth-token': localStorage.getItem('adminToken') } }
      );
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Fetch categories (with parentCategory populated)
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Mark as sold
  const handleMarkSold = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/product/sold/${id}`,
        {},
        { headers: { 'x-auth-token': localStorage.getItem('adminToken') } }
      );
      fetchProducts();
      alert('Product marked as sold');
    } catch {
      alert('Error marking product as sold');
    }
  };

  // Filter logic
  const filteredProducts = products.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.productId.toLowerCase().includes(q);

    // extract parentCategory ID (could be object or string)
    const rawParent = p.category.parentCategory;
    const parentId  = rawParent && rawParent._id ? rawParent._id : rawParent;

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === p.category._id ||
      selectedCategory === parentId;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-5">
      {/* Search & Category Filter using CSS Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-[#1976d2]">
        <input
          type="text"
          placeholder="Search by Name or ID"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full border rounded p-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2]"
        />

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full border rounded p-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2]"
        >
          <option value="">All Categories</option>

          {categories
            .filter(c => c.isParent)
            .map(parent => (
              <optgroup key={parent._id} label={parent.name}>
                <option value={parent._id}>{parent.name}</option>
                {categories
                  .filter(ch => !ch.isParent && ch.parentCategory?._id === parent._id)
                  .map(child => (
                    <option key={child._id} value={child._id}>
                      ↳ {child.name}
                    </option>
                  ))}
              </optgroup>
            ))}
        </select>
      </div>

      <TableContainer
  component={Paper}
  sx={{ maxHeight: 500 }}   // or a height you prefer
>
  <Table stickyHeader>
    <TableHead>
      <TableRow>
        <TableCell>Product ID</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Category</TableCell>
        <TableCell>Stock</TableCell>
        <TableCell>Last Modified</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredProducts.length > 0 ? (
        filteredProducts.map(p => (
          <TableRow key={p._id}>
            <TableCell>{p.productId}</TableCell>
            <TableCell>{p.title}</TableCell>
            <TableCell>{p.category.name}</TableCell>
            <TableCell>{p.stock}</TableCell>
            <TableCell>{new Date(p.updatedAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button variant="contained" onClick={() => handleMarkSold(p._id)}>
                Mark as Sold
              </Button>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={6} align="center">
            No products found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>
    </div>
  );
};

export default ProductList;
