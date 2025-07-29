import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../admincomponents/header/Header';
import LeftMenu from '../admincomponents/menu/left_menu/LeftMenu';
import MainContainer from '../admincomponents/container/MainContainer';
import ContentDisplay from '../admincomponents/ContentDisplay';
import { BrowserRouter as Router } from 'react-router-dom';

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
          <ContentDisplay stats={stats} />
        </MainContainer>
      </div>
    </div>
  );
};

export default Dashboard;
