// src/admincomponents/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { getStats } from '../../user-panel/api/api';
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
        const data = await getStats();
        setStats({
          totalProducts: data.totalProducts,
          totalSold:    data.totalSold,
          totalSearches:data.totalSearches,
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
