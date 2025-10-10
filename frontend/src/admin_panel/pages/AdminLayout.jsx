import React from 'react';
import Header from '../admincomponents/header/Header';
import LeftMenu from '../admincomponents/menu/left_menu/LeftMenu';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const handleMenuItemClick = (menuItem, path) => {
    navigate(path); // Dynamically navigate to the new path
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex" style={{ flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      <Header />

      <div className="flex flex-row" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Sidebar - Hidden on mobile by default, shown when toggled */}
        <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0`}>
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative">
            <LeftMenu onMenuItemClick={handleMenuItemClick} activePath={activePath} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:ml-64">
          <Outlet /> {/* The dynamic page content will be rendered here */}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
