// components/dashboard/ContentDisplay.jsx
import React from 'react';
import { Grid, Typography } from '@mui/material';
import StatsCard from './cards/StatsCard';
import ProductList from '../pages/ProductList';
import ProductAdd from '../pages/ProductAdd'; // import it


const ContentDisplay = ({ selectedMenu, stats }) => {
  switch (selectedMenu) {
    case 'Orders':
      return (
        <Grid container spacing={3} style={{ marginTop: '2rem' }}>
          <Grid item xs={12}>
            <Typography variant="h5">Order List</Typography>
            <Typography variant="body1">Here you can manage your orders.</Typography>
          </Grid>
        </Grid>
      );
    case 'Products':
      return (
        <Grid container spacing={3} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
          <ProductList />
        </Grid>
      );
    case 'Categories':
      return (
        <Grid container spacing={3} style={{ marginTop: '2rem' }}>
          <Grid item xs={12}>
            <Typography variant="h5">Category List</Typography>
            {/* Category list content */}
          </Grid>
        </Grid>
      );

    case 'AddProduct':
      return (
        <Grid container spacing={3} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
          <ProductAdd />
        </Grid>
      );
    default:
      return (
        <Grid container spacing={3} style={{ marginTop: '2rem' }}>
          <StatsCard title="Total Products" value={stats.totalProducts} />
          <StatsCard title="Total Sold" value={stats.totalSold} />
          <StatsCard title="Total Searches" value={stats.totalSearches} />
        </Grid>
      );
  }
};

export default ContentDisplay;
