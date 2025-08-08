import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Chip,
  Avatar,
  Stack,
  Tooltip,
  Alert,
  Breadcrumbs,
  Divider,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { 
  getCategories, 
  addCategory, 
  removeCategory, 
  updateCategory,
  getProducts 
} from "../../user-panel/api/api";
import { Link, useNavigate } from "react-router-dom";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  FolderOpen as FolderIcon,
  Article as ProductIcon,
  NavigateNext as NavigateNextIcon,
  Clear as ClearIcon
} from "@mui/icons-material";

// Enhanced CategoryManagement Form Component
const CategoryManagement = ({ onSuccess, categoryToEdit, categories = [] }) => {
  const [categoryName, setCategoryName] = useState(categoryToEdit ? categoryToEdit.name : "");
  const [description, setDescription] = useState(categoryToEdit ? categoryToEdit.description : "");
  const [isParent, setIsParent] = useState(categoryToEdit ? categoryToEdit.isParent : true);
  const [parentCategory, setParentCategory] = useState(categoryToEdit ? categoryToEdit.parentCategory?._id || "" : "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!categoryName.trim()) newErrors.categoryName = "Category name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!isParent && !parentCategory) newErrors.parentCategory = "Parent category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const categoryData = {
        name: categoryName.trim(),
        description: description.trim(),
        isParent,
        parentCategory: isParent ? null : parentCategory
      };

      if (categoryToEdit) {
        await updateCategory(categoryToEdit._id, categoryData);
      } else {
        await addCategory(categoryData);
      }

      onSuccess();
      // Reset form
      setCategoryName("");
      setDescription("");
      setIsParent(true);
      setParentCategory("");
      setErrors({});
    } catch (err) {
      setErrors({ submit: err.response?.data?.msg || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Allow selection from all categories, not just parent categories
  const availableParentCategories = categories.filter(cat => 
    // Don't show the category being edited as a potential parent (prevents circular reference)
    categoryToEdit ? cat._id !== categoryToEdit._id : true
  );

  return (
    <Box sx={{ mt: 2 }}>
      {errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}
      
      <TextField
        label="Category Name"
        value={categoryName}
        onChange={(e) => {
          setCategoryName(e.target.value);
          if (errors.categoryName) setErrors({...errors, categoryName: null});
        }}
        fullWidth
        sx={{ mb: 2 }}
        error={!!errors.categoryName}
        helperText={errors.categoryName}
      />
      
      <TextField
        label="Description"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          if (errors.description) setErrors({...errors, description: null});
        }}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 2 }}
        error={!!errors.description}
        helperText={errors.description}
      />
      
      <FormControlLabel
        control={
          <Switch 
            checked={isParent} 
            onChange={(e) => {
              setIsParent(e.target.checked);
              if (e.target.checked) {
                setParentCategory("");
                setErrors({...errors, parentCategory: null});
              }
            }} 
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon fontSize="small" />
            Is Parent Category?
          </Box>
        }
      />
      
      {!isParent && (
        <FormControl fullWidth sx={{ mt: 2, mb: 2 }} error={!!errors.parentCategory}>
          <InputLabel>Parent Category</InputLabel>
          <Select
            value={parentCategory}
            label="Parent Category"
            onChange={(e) => {
              setParentCategory(e.target.value);
              if (errors.parentCategory) setErrors({...errors, parentCategory: null});
            }}
          >
            {availableParentCategories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {cat.isParent ? <FolderIcon fontSize="small" /> : <CategoryIcon fontSize="small" />}
                  <Box>
                    <Typography variant="body2">{cat.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cat.isParent ? 'Parent Category' : 'Child Category'}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {errors.parentCategory && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
              {errors.parentCategory}
            </Typography>
          )}
        </FormControl>
      )}
      
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="contained"
          onClick={handleCategorySubmit}
          disabled={loading || !categoryName || !description || (!isParent && !parentCategory)}
          sx={{ minWidth: 120 }}
        >
          {loading ? "Saving..." : (categoryToEdit ? "Update" : "Create")}
        </Button>
      </Box>
    </Box>
  );
};

// Enhanced CategoryList Component
const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [productCounts, setProductCounts] = useState({});
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      const list = Array.isArray(data) ? data : data.categories;
      setCategories(list || []);
      
      // Fetch product counts for each category
      const counts = {};
      for (const category of list || []) {
        try {
          const products = await getProducts({ category: category._id });
          counts[category._id] = products.products?.length || 0;
        } catch (err) {
          counts[category._id] = 0;
        }
      }
      setProductCounts(counts);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType === "parent") {
      filtered = filtered.filter(cat => cat.isParent);
    } else if (filterType === "child") {
      filtered = filtered.filter(cat => !cat.isParent);
    }

    setFilteredCategories(filtered);
    setPage(0);
  }, [categories, searchTerm, filterType]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCategoryToEdit(null);
    fetchCategories();
  };

  const handleEdit = (category) => {
    setCategoryToEdit(category);
    setOpen(true);
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      try {
        await removeCategory(categoryId);
        fetchCategories();
      } catch (err) {
        alert(`Error: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  const handleViewProducts = (categoryId, categoryName) => {
    navigate(`/admin/products?category=${categoryId}&categoryName=${categoryName}`);
  };

  const renderCategoryCard = (category) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: category.isParent ? 'primary.main' : 'secondary.main',
                mr: 2
              }}
            >
              {category.isParent ? <FolderIcon /> : <CategoryIcon />}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap>
                {category.name}
              </Typography>
              <Chip 
                label={category.isParent ? "Parent" : "Child"} 
                size="small"
                color={category.isParent ? "primary" : "secondary"}
                variant="outlined"
              />
            </Box>
          </Box>
          
          {!category.isParent && category.parentCategory && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Parent: {category.parentCategory.name}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {category.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ProductIcon fontSize="small" color="action" />
            <Typography variant="caption">
              {productCounts[category._id] || 0} products
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="View Products">
              <IconButton 
                size="small" 
                color="info"
                onClick={() => handleViewProducts(category._id, category.name)}
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Category">
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleEdit(category)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Category">
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => handleDelete(category._id, category.name)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderCategoryTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Parent</TableCell>
            <TableCell>Products</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCategories
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((category) => (
              <TableRow key={category._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {category.isParent ? <FolderIcon color="primary" /> : <CategoryIcon color="secondary" />}
                    <Typography fontWeight="medium">{category.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={category.isParent ? "Parent" : "Child"} 
                    size="small"
                    color={category.isParent ? "primary" : "secondary"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {category.parentCategory?.name || "-"}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={productCounts[category._id] || 0}
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewProducts(category._id, category.name)}
                    clickable
                  />
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" noWrap>
                    {category.description}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="View Products">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleViewProducts(category._id, category.name)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleEdit(category)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(category._id, category.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Loading categories...</Typography>
      </Box>
    );
  }

  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
            Admin
          </Link>
          <Typography color="text.primary">Categories</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
          Category Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your product categories and organize your inventory
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Search categories..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label="Filter by Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="parent">Parent Categories</MenuItem>
                <MenuItem value="child">Child Categories</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="table">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              fullWidth
              sx={{ height: 56 }}
            >
              Add Category
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Categories
              </Typography>
              <Typography variant="h4">
                {filteredCategories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Parent Categories
              </Typography>
              <Typography variant="h4">
                {filteredCategories.filter(cat => cat.isParent).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Child Categories
              </Typography>
              <Typography variant="h4">
                {filteredCategories.filter(cat => !cat.isParent).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories Display */}
      {filteredCategories.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No categories found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first category"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Create Category
          </Button>
        </Paper>
      ) : (
        <>
          {viewMode === "grid" ? (
            <Grid container spacing={3}>
              {paginatedCategories.map(renderCategoryCard)}
            </Grid>
          ) : (
            renderCategoryTable()
          )}
          
          <TablePagination
            rowsPerPageOptions={[12, 24, 48]}
            component="div"
            count={filteredCategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}

      {/* Category Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon />
            {categoryToEdit ? "Edit Category" : "Create New Category"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <CategoryManagement 
            onSuccess={handleClose} 
            categoryToEdit={categoryToEdit}
            categories={categories}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryList;