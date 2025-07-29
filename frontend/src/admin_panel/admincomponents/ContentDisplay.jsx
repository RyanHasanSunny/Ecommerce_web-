import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import StatsCard from './cards/StatsCard';
import ProductList from '../pages/ProductList';
import ProductAdd from '../pages/ProductAdd'; // import it
import ProductManagement from '../pages/ProductManagement'; // if you want to handle product details and add in same component

const ContentDisplay = ({ stats }) => {
  return (
    <Routes>
      <Route 
        path="/admin/dashboard/products" 
        element={
          <Grid container spacing={3} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
            <ProductList />
          </Grid>
        }
      />

      {/* Route for Add Product */}
      <Route 
        path="/admin/dashboard/products/add" 
        element={
          <Grid container spacing={3} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
            <ProductAdd />
          </Grid>
        }
      />

      {/* Route for Individual Product (Edit) */}
      <Route 
        path="/admin/dashboard/product/:productId" 
        element={
          <Grid container spacing={3} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
            <ProductManagement />
          </Grid>
        }
      />

      {/* Default route when no other match is found */}
      <Route 
        path="/admin/dashboard" 
        element={
          <Grid container spacing={3} style={{ marginTop: '2rem' }}>
            <StatsCard title="Total Products" value={stats.totalProducts} />
            <StatsCard title="Total Sold" value={stats.totalSold} />
            <StatsCard title="Total Searches" value={stats.totalSearches} />
          </Grid>
        }
      />
    </Routes>
  );
};

export default ContentDisplay;
