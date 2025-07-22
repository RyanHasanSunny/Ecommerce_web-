// pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/header/Header';
import LeftMenu from '../../components/menu/left_menu/LeftMenu';
import MainContainer from '../../components/container/MainContainer';
import ContentDisplay from '../../components/ContentDisplay';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSold: 0,
    totalSearches: 0,
  });
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');

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

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenu(menuItem); // Set the selected menu item
  };

  return (
    <div className="flex" style={{ flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Header />
      <div className="flex flex-row" style={{ flex: 1, overflowY: 'auto' }}>
        <LeftMenu onMenuItemClick={handleMenuItemClick} />
        <MainContainer title={selectedMenu}>
          <ContentDisplay selectedMenu={selectedMenu} stats={stats} />
        </MainContainer>
      </div>
    </div>
  );
};

export default Dashboard;
