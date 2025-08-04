import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContentDisplay from '../admincomponents/ContentDisplay';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSold: 0,
    totalSearches: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://18.212.65.1:5000/api/stats', {
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

  return <ContentDisplay stats={stats} />;
};

export default Dashboard;
