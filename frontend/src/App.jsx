import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './admin_panel/pages/Login';
import Dashboard from './admin_panel/pages/Dashboard';
import CategoryManagement from './admin_panel/pages/CategoryManagement';
 import ProductManagement from './admin_panel/pages/ProductManagement';
import ProductList from './admin_panel/pages/ProductList';
import ProductAdd from './admin_panel/pages/ProductAdd'; // Import ProductAdd
import PrivateRoute from './admin_panel/admincomponents/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/adminlogin" element={<Login />} />
        <Route path="/admin/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin/category" element={<PrivateRoute><CategoryManagement /></PrivateRoute>} />
        <Route path="/admin/dashboard/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
        <Route path="/admin/productadd" element={<PrivateRoute><ProductAdd /></PrivateRoute>} />
        <Route path="/admin/productmanagement" element={<PrivateRoute><ProductManagement /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
