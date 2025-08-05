import React, { useState, useEffect } from 'react';
import { getProducts } from '../../user-panel/api/api';  // Assuming you have an API for fetching products
import ProductCard from '../components/ProductPanelCard/productcard/ProductCard';
import { Box, Typography, Slider, Select, MenuItem, InputLabel, FormControl, Button } from '@mui/material';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([2699, 48000]);
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleAvailabilityChange = (event) => {
    setAvailability(event.target.value);
  };

  const applyFilters = () => {
    let filtered = products.filter((product) => {
      const isPriceInRange = product.finalPrice >= priceRange[0] && product.finalPrice <= priceRange[1];
      const isAvailabilityMatch = availability ? product.availability === availability : true;

      return isPriceInRange && isAvailabilityMatch;
    });

    setFilteredProducts(filtered);
  };

  if (loading) {
    return <Typography variant="h6">Loading products...</Typography>;
  }

  return (
    <Box sx={{ padding: '20px' }}>
      {/* Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box sx={{ width: '48%' }}>
          <Typography variant="h6" gutterBottom>Price Range</Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `BDT ${value}`}
            min={2699}
            max={48000}
          />
        </Box>

        <Box sx={{ width: '48%' }}>
          <Typography variant="h6" gutterBottom>Availability</Typography>
          <FormControl fullWidth>
            <InputLabel>Availability</InputLabel>
            <Select
              value={availability}
              onChange={handleAvailabilityChange}
              label="Availability"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="In Stock">In Stock</MenuItem>
              <MenuItem value="Pre Order">Pre Order</MenuItem>
              <MenuItem value="Up Coming">Up Coming</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Button variant="contained" color="primary" onClick={applyFilters}>Apply Filters</Button>

      {/* Product Panel */}
      <Box sx={{ marginTop: '40px' }}>
        <Typography variant="h4" gutterBottom>Products</Typography>

        <div className="flex flex-wrap justify-center gap-6 max-w-7xl w-full">
          {filteredProducts.length === 0 ? (
            <Typography>No products available based on the filters.</Typography>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                thumbnail={product.thumbnail}
                title={product.title}
                sellingPrice={product.sellingPrice}
                offerPrice={product.offerPrice}
              />
            ))
          )}
        </div>
      </Box>
    </Box>
  );
};

export default ProductPage;
