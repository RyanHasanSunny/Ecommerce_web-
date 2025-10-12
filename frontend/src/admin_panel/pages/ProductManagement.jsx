import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Box,
  Divider,
  Paper,
  Card,
  CardContent,
  Chip,
  Alert,
  Snackbar,
  Skeleton,
  Container,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductById,
  addProduct,
  updateProduct,
  getCategories
} from "../../user-panel/api/api";
import EnhancedImageUpload from "../admincomponents/fileds/imageupload/EnhancedImageUpload";

const ProductManagement = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));



  const [specifications, setSpecifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specForm, setSpecForm] = useState({
    title: "",
    details: "",
    editIndex: null
  });


  // Updated form state in React component
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    description: "",
    price: "",
    expectedProfit: "",
    sellingPrice: "",
    deliveryCharge: "",
    stock: "",
    offerValue: "",
    finalPrice: "",
    categoryId: "",
    thumbnail: "",
    images: []
  });


  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [showPreview, setShowPreview] = useState(false);

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const closeAlert = () => {
    setAlert({ ...alert, open: false });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const raw = await getCategories();
        const list =
          Array.isArray(raw) ? raw :
            Array.isArray(raw.data) ? raw.data :
              Array.isArray(raw.categories) ? raw.categories
                : [];
        setCategories(list);

        // Fetch product details if editing
        if (productId) {
          const product = await getProductById(productId);
          setFormData({
            title: product.title || "",
            companyName: product.companyName || "",
            description: product.description || "",
            price: product.price || "",
            expectedProfit: product.expectedProfit || "",
            stock: product.stock || "",
            offerValue: product.offerValue || "",
            categoryId: product.category?._id || "",
            thumbnail: product.thumbnail || "",
            images: product.images || []
          });
          setSpecifications(product.specifications || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        showAlert("Error loading data. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecificationSubmit = () => {
    if (!specForm.title.trim() || !specForm.details.trim()) {
      showAlert("Please fill in both specification title and details", "warning");
      return;
    }

    const newSpec = {
      title: specForm.title.trim(),
      details: specForm.details.trim()
    };

    if (specForm.editIndex !== null) {
      // Edit existing specification
      const updated = [...specifications];
      updated[specForm.editIndex] = newSpec;
      setSpecifications(updated);
      showAlert("Specification updated successfully", "success");
    } else {
      // Add new specification
      setSpecifications(prev => [...prev, newSpec]);
      showAlert("Specification added successfully", "success");
    }

    // Reset form
    setSpecForm({
      title: "",
      details: "",
      editIndex: null
    });
  };

  const handleEditSpecification = (index) => {
    const spec = specifications[index];
    setSpecForm({
      title: spec.title,
      details: spec.details,
      editIndex: index
    });
  };

  const handleDeleteSpecification = (index) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index));
    showAlert("Specification deleted", "info");

    // Reset form if editing the deleted spec
    if (specForm.editIndex === index) {
      setSpecForm({
        title: "",
        details: "",
        editIndex: null
      });
    }
  };

  const calculateSellingPrice = () => {
    const unitPrice = parseFloat(formData.price) || 0;
    const profit = parseFloat(formData.expectedProfit) || 0;
    const deliveryCharge = parseFloat(formData.deliveryCharge) || 0;
    const offerValue = parseFloat(formData.offerValue) || 0;
    return unitPrice + profit + deliveryCharge - offerValue;
  };

  const calculateFinalPrice = () => {
    return calculateSellingPrice();
  };



  const validateForm = () => {
    const required = ['title', 'description', 'price', 'expectedProfit', 'stock', 'categoryId'];
    const missing = required.filter(field => !formData[field]?.toString().trim());

    if (missing.length > 0) {
      showAlert(`Please fill in: ${missing.join(', ')}`, "error");
      return false;
    }

    if (!formData.thumbnail) {
      showAlert("Please upload a thumbnail image", "error");
      return false;
    }

    if (parseFloat(formData.price) < 0 || parseFloat(formData.expectedProfit) < 0) {
      showAlert("Price and profit must be positive numbers", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        specifications,
        price: parseFloat(formData.price),                    // Unit price
        expectedProfit: parseFloat(formData.expectedProfit),                  // Profit
        sellingPrice: calculateSellingPrice(),
        deliveryCharge: formData.deliveryCharge ? parseFloat(formData.deliveryCharge) : 0,
        stock: parseInt(formData.stock),
        offerValue: parseFloat(formData.offerValue),
        finalPrice: calculateFinalPrice(),
        // sellingPrice and finalPrice will be auto-calculated in the backend
      };

      if (productId) {
        await updateProduct(productId, payload);
        showAlert("Product updated successfully!", "success");
      } else {
        await addProduct(payload);
        showAlert("Product added successfully!", "success");
      }

      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      console.error("Submit error:", err);
      showAlert(`Error: ${err.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Fade in={true} timeout={800}>
        <Box>
          {/* Header */}
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton
              onClick={() => navigate("/admin/products")}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              {productId ? "Edit Product" : "Add New Product"}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setShowPreview(!showPreview)}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Preview
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Basic Information */}
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Basic Information
                </Typography>

                <Grid container spacing={3} direction="column">
                  <Grid item xs={12}>
                    <TextField
                      label="Product Title"
                      variant="outlined"
                      fullWidth
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter product title"
                      sx={{ '& .MuiInputBase-input': { overflow: 'visible' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Company Name"
                      variant="outlined"
                      fullWidth
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      variant="outlined"
                      fullWidth
                      multiline
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter detailed product description"
                      sx={{ '& .MuiInputBase-input': { overflow: 'visible' } }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Images Section */}
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Product Images
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <EnhancedImageUpload
                      images={formData.thumbnail ? [formData.thumbnail] : []}
                      onImagesChange={(newImages) => handleInputChange('thumbnail', newImages[0] || "")}
                      maxImages={1}
                      title="Thumbnail Image (Required)"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <EnhancedImageUpload
                      images={formData.images}
                      onImagesChange={(newImages) => handleInputChange('images', newImages)}
                      maxImages={5}
                      title="Additional Images"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Specifications */}
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Specifications
                </Typography>

                {/* Existing Specifications */}
                <Box mb={3}>
                  {specifications.map((spec, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent sx={{ py: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                              {spec.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>
                              {spec.details}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditSpecification(index)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteSpecification(index)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Add/Edit Specification Form */}
                <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {specForm.editIndex !== null ? 'Edit Specification' : 'Add New Specification'}
                    </Typography>
                    <Grid container spacing={2} direction="column">
                      <Grid item xs={12}>
                        <TextField
                          label="Specification Title"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={specForm.title}
                          onChange={(e) => setSpecForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Processor"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Details"
                          variant="outlined"
                          fullWidth
                          size="small"
                          multiline
                          minRows={3}
                          value={specForm.details}
                          onChange={(e) => setSpecForm(prev => ({ ...prev, details: e.target.value }))}
                          placeholder="e.g., Intel Core i7-12700K"
                          sx={{ '& .MuiInputBase-input': { overflow: 'visible' } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" gap={1}>
                          <IconButton
                            onClick={handleSpecificationSubmit}
                            color="primary"
                            disabled={!specForm.title.trim() || !specForm.details.trim()}
                          >
                            <SaveIcon />
                          </IconButton>
                          {specForm.editIndex !== null && (
                            <IconButton
                              onClick={() => setSpecForm({ title: "", details: "", editIndex: null })}
                              color="default"
                            >
                              <CancelIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Paper>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, position: isTablet ? 'static' : 'sticky', top: 20 }}>

                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Category & Pricing
                </Typography>



                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>Select Category</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Pricing */}
                {/* Pricing Section - Replace the existing pricing grid */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Unit Price"
                      type="number"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      helperText="Base cost of the product"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Profit"
                      type="number"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.expectedProfit}
                      onChange={(e) => handleInputChange('expectedProfit', e.target.value)}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      helperText="Profit margin"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Delivery Charge"
                      type="number"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.deliveryCharge}
                      onChange={(e) => handleInputChange('deliveryCharge', e.target.value)}
                      placeholder="Optional"
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      helperText="Product-specific delivery charge"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Stock"
                      type="number"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      InputProps={{ inputProps: { min: 0, step: 1 } }}
                      helperText="Available quantity"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Offer Value (Discount)"
                      type="number"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.offerValue}
                      onChange={(e) => handleInputChange('offerValue', e.target.value)}
                      placeholder="Discount amount (optional)"
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      helperText="Discount amount to subtract from selling price"
                    />
                  </Grid>
                </Grid>

                {/* Price Summary */}
                <Card variant="outlined" sx={{ mt: 3, bgcolor: 'primary.50' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Price Calculation
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Unit Price:</Typography>
                      <Typography variant="body2">৳{formData.price || 0}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">+ Profit:</Typography>
                      <Typography variant="body2">৳{formData.expectedProfit || 0}</Typography>
                    </Box>
                    {formData.deliveryCharge && (
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">+ Delivery Charge:</Typography>
                        <Typography variant="body2">৳{formData.deliveryCharge}</Typography>
                      </Box>
                    )}
                    {formData.offerValue && (
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="error">
                          - Offer Value:
                        </Typography>
                        <Typography variant="body2" color="error">
                          ৳{formData.offerValue}
                        </Typography>
                      </Box>
                    )}
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle2" color="info.main">
                        Net Profit:
                      </Typography>
                      <Typography variant="subtitle2" color="info.main">
                        ৳{parseFloat(formData.expectedProfit || 0) - parseFloat(formData.offerValue || 0)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6" color="success.main">
                        Final Price:
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        ৳{calculateFinalPrice()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Status Chips */}
                <Box mt={3} display="flex" flexWrap="wrap" gap={1}>
                  <Chip
                    label={`${specifications.length} Specifications`}
                    color={specifications.length > 0 ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={`${formData.images.length} Images`}
                    color={formData.images.length > 0 ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={formData.thumbnail ? "Thumbnail ✓" : "No Thumbnail"}
                    color={formData.thumbnail ? "success" : "error"}
                    size="small"
                  />
                </Box>

                {/* Submit Button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{ mt: 4 }}
                >
                  {submitting
                    ? (productId ? "Updating..." : "Adding...")
                    : (productId ? "Update Product" : "Add Product")
                  }
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Preview Section */}
          <Collapse in={showPreview}>
            <Paper sx={{ mt: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Product Preview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  {formData.thumbnail && (
                    <img
                      src={formData.thumbnail}
                      alt="Product preview"
                      style={{ width: '100%', maxWidth: '300px', borderRadius: 8 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6">{formData.title || "Product Title"}</Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {formData.companyName || "Company Name"}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {formData.description || "Product description..."}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ৳{calculateFinalPrice()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </Box>
      </Fade>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductManagement;