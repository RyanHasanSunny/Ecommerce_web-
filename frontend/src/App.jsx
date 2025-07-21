import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './admin_panel/pages/Login';
import Dashboard from './admin_panel/pages/Dashboard';
import CategoryManagement from './admin_panel/pages/CategoryManagement';
import ProductManagement from './admin_panel/pages/ProductManagement';
import ProductList from './admin_panel/pages/ProductList';
//import SoldProduct from './admin_panel/pages/SoldProduct';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
     
      <Routes>
        <Route path="/adminlogin" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/category-management" element={<PrivateRoute><CategoryManagement /></PrivateRoute>} />
        <Route path="/product-management" element={<PrivateRoute><ProductManagement /></PrivateRoute>} />
        <Route path="/product-list" element={<PrivateRoute><ProductList /></PrivateRoute>} />
        {/* <Route path="/sold-product" element={<PrivateRoute><SoldProduct /></PrivateRoute>} /> */}
      </Routes>
    </Router>
  );
}

export default App;
