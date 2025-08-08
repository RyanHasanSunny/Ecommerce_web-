// src/admincomponents/ProductList.jsx
import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, Typography, Box, TextField, FormControl,
  InputLabel, Select, MenuItem, Chip, Grid, Card, CardContent
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CategoryIcon from "@mui/icons-material/Category";
import FolderIcon from "@mui/icons-material/Folder";
import {
  getAdminProducts,
  deleteProduct,
  getCategories,
} from "../../user-panel/api/api";

const ProductList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Check if we're coming from category management with a pre-selected category
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryId = urlParams.get('category');
    const categoryName = urlParams.get('categoryName');
    
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [location]);

  // load products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // load categories - Updated to get ALL categories
  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      // If API returns { categories: [...] }, use that; otherwise assume it's already an array
      const list = Array.isArray(result) ? result : result.categories;
      setCategories(list || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Enhanced filter logic
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.productId.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q);

    // Enhanced category matching
    const matchesCategory = !selectedCategory || 
      selectedCategory === p.category._id ||
      selectedCategory === p.category?.parentCategory?._id ||
      selectedCategory === p.category?.parentCategory;

    return matchesSearch && matchesCategory;
  });

  const handleEditProduct = (id) => navigate(`/admin/products/edit/${id}`);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      alert("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      alert(`Error deleting product: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    // Clear URL params
    navigate('/admin/products', { replace: true });
  };

  // Get category name for display
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "";
    const category = categories.find(cat => cat._id === selectedCategory);
    return category ? category.name : "";
  };

  // Group categories for better display
  const getCategoriesGrouped = () => {
    const parentCategories = categories.filter(cat => cat.isParent);
    const childCategories = categories.filter(cat => !cat.isParent);
    
    return { parentCategories, childCategories };
  };

  const { parentCategories, childCategories } = getCategoriesGrouped();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  return (
    <div className="admin-products flex text-left justify-center">
      <Box sx={{ width: '100%', maxWidth: '1400px', p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4">Products</Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredProducts.length} of {products.length} products
              {selectedCategory && ` in "${getSelectedCategoryName()}"`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/products/add")}
            sx={{ minWidth: 140 }}
          >
            + Add Product
          </Button>
        </Box>

        {/* Enhanced Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Products"
                placeholder="Search by Name, ID, Description, or Category"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Filter by Category"
                  startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  
                  {/* Parent Categories */}
                  {parentCategories.map((parent) => (
                    <MenuItem key={parent._id} value={parent._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FolderIcon fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {parent.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Parent Category
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                  
                  {/* Child Categories */}
                  {childCategories.map((child) => {
                    const parentName = parentCategories.find(p => 
                      p._id === (child.parentCategory?._id || child.parentCategory)
                    )?.name || 'Unknown Parent';
                    
                    return (
                      <MenuItem key={child._id} value={child._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                          <CategoryIcon fontSize="small" color="secondary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {child.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Under: {parentName}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                disabled={!searchQuery && !selectedCategory}
                sx={{ height: 56 }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  onDelete={() => setSearchQuery("")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {selectedCategory && (
                <Chip
                  label={`Category: ${getSelectedCategoryName()}`}
                  onDelete={() => setSelectedCategory("")}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h5">
                  {products.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Filtered Results
                </Typography>
                <Typography variant="h5">
                  {filteredProducts.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Low Stock
                </Typography>
                <Typography variant="h5">
                  {filteredProducts.filter(p => p.stock < 10).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Out of Stock
                </Typography>
                <Typography variant="h5">
                  {filteredProducts.filter(p => p.stock === 0).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Table */}
        <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 400px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "Product ID",
                  "Name",
                  "Category",
                  "Stock",
                  "Last Modified",
                  "Price (BDT)",
                  "Profit (BDT)",
                  "Selling Price (BDT)",
                  "Offer Price (BDT)",
                  "Actions",
                ].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {p.productId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {p.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {p.category?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.stock}
                        size="small"
                        color={
                          p.stock === 0 ? 'error' : 
                          p.stock < 10 ? 'warning' : 
                          'success'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ৳{p.price?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        ৳{p.profit?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ৳{p.sellingPrice?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {p.offerPrice ? (
                        <Typography variant="body2" color="error.main" fontWeight="medium">
                          ৳{p.offerPrice.toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditProduct(p._id)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteProduct(p._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No products found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery || selectedCategory 
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by adding your first product"
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
};

export default ProductList;