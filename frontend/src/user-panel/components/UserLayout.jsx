import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Header from './header/Header';
import Footer from './footer/Footer';

const UserLayout = ({ children }) => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet/>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default UserLayout;
