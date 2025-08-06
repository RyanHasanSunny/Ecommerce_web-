// src/user-panel/components/UserLayout.jsx - FIXED VERSION

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header/Header';
import Footer from './footer/Footer';

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;