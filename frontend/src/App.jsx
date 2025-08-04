import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './admin_panel/pages/Login';
import AdminLayout from './admin_panel/pages/AdminLayout'; // Import the layout
import Dashboard from './admin_panel/pages/Dashboard';
import CategoryManagement from './admin_panel/pages/CategoryManagement';
import ProductManagement from './admin_panel/pages/ProductManagement';
import ProductList from './admin_panel/pages/ProductList';
import ProductAdd from './admin_panel/pages/ProductAdd'; 
import PrivateRoute from './admin_panel/admincomponents/PrivateRoute';
<<<<<<< HEAD
=======
import { HomePage } from './user-panel/pages/home_page';
>>>>>>> parent of f742eb4 (Refactor product model and UI for new pricing and images)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/adminlogin" element={<Login />} />
     
          {/* Wrap all admin routes inside the AdminLayout */}
          <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route path="/admin/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
            <Route path="/admin/products/add" element={<PrivateRoute><ProductAdd /></PrivateRoute>} />
            <Route path="/admin/products/edit/:productId" element={<PrivateRoute><ProductManagement /></PrivateRoute>} /> {/* Edit route */}
            <Route path="/admin/categories" element={<PrivateRoute><CategoryManagement /></PrivateRoute>} />
          </Route>
       
      </Routes>
    </Router>
  );
}

export default App;
