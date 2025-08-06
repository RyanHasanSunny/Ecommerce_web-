import React from 'react';
import Header from '../admincomponents/header/Header';
import LeftMenu from '../admincomponents/menu/left_menu/LeftMenu';
import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const AdminLayout = () => {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const navigate = useNavigate();

  const handleMenuItemClick = (menuItem, path) => {
    setSelectedMenu(menuItem);
    navigate(path); // Dynamically navigate to the new path
  };

  return (
    <div className="flex" style={{ flexDirection: 'column', }}>
      <Header />
      <div className="flex flex-row" style={{ flex: 1, overflowY: 'auto' }}>
        <LeftMenu onMenuItemClick={handleMenuItemClick} />
        <div className="flex-1 p-4">
          <Outlet /> {/* The dynamic page content will be rendered here */}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
