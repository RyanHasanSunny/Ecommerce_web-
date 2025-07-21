import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSold: 0,
    totalSearches: 0,
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');  // Remove the admin token from localStorage
    navigate('/adminlogin');  // Redirect to the login page
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stats', {
          headers: {
            'x-auth-token': localStorage.getItem('adminToken'),
          },
        });

        setStats({
          totalProducts: response.data.totalProducts,
          totalSold: response.data.totalSold,
          totalSearches: response.data.totalSearches,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Products</Typography>
              <Typography variant="h4">{stats.totalProducts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Sold</Typography>
              <Typography variant="h4">{stats.totalSold}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Searches</Typography>
              <Typography variant="h4">{stats.totalSearches}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
