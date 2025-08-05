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
import { HomePage } from './user-panel/pages/home_page';
import ProductPage from './user-panel/pages/ProductPage'; // Import ProductPage
// import Header from './user-panel/components/header/Header';
// import Footer from './user-panel/components/footer/Footer';
import './App.css'; // Import your main CSS file
import LoginPage from './user-panel/pages/Login-page';
import SignupPage from './user-panel/pages/Signup_page'; // Import SignupPage
import UserLayout from './user-panel/components/UserLayout';
import { AuthProvider } from './user-panel/context/AuthContext';
import Profile_Page from './user-panel/pages/profile_page'; // Import Profile_Page

function App() {
  return (
    <div className="App ">
      {/* <Header /> */}
      <Router>
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<HomePage/>}/>
            <Route path= "/profile" element={<Profile_Page/>} />
            <Route path="/product/:productId" element={<ProductPage />} />
          </Route>

          <Route path="/signup" element={ <AuthProvider> <SignupPage /></AuthProvider>} />
          <Route path="/adminlogin" element={<Login />} />
          <Route path="/login" element={ <AuthProvider> <LoginPage /></AuthProvider>} />
          {/* Public routes for user panel */}


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
      {/* <Footer /> */}
    </div>
  );
}

export default App;
