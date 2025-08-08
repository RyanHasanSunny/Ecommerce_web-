// src/App.jsx - UPDATED VERSION

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './user-panel/context/AuthContext';
import { Loader } from 'lucide-react';
import RouteLoader from './RouteLoader';
import ScrollToTop from './ScrollToTop';
import './App.css';

// -- full-page loader component
const FullPageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <Loader className="w-12 h-12 animate-spin text-blue-600" />
  </div>
);

// -- lazily imported user-panel pages
const UserLayout      = lazy(() => import('./user-panel/components/UserLayout'));
const HomePage        = lazy(() => import('./user-panel/pages/home_page'));
const UserProductList = lazy(() => import('./user-panel/pages/productlist'));
const ProductPage     = lazy(() => import('./user-panel/pages/ProductPage'));
const LoginPage       = lazy(() => import('./user-panel/pages/Login-page'));
const SignupPage      = lazy(() => import('./user-panel/pages/Signup_page'));
const ProfilePage     = lazy(() => import('./user-panel/pages/profile_page'));
const CartPage        = lazy(() => import('./user-panel/pages/CartPage'));
const CheckoutPage    = lazy(() => import('./user-panel/components/paymentModal/PaymentModal'));
const OrdersPage      = lazy(() => import('./user-panel/pages/OrderPage'));
const OrderDetailPage = lazy(() => import('./user-panel/pages/OrderDetailPage'));

// -- lazily imported admin-panel pages
const AdminLogin        = lazy(() => import('./admin_panel/pages/Login'));
const AdminLayout       = lazy(() => import('./admin_panel/pages/AdminLayout'));
const Dashboard         = lazy(() => import('./admin_panel/pages/Dashboard'));
const CategoryManagement= lazy(() => import('./admin_panel/pages/CategoryManagement'));
const ProductList       = lazy(() => import('./admin_panel/pages/ProductList'));
const ProductAdd        = lazy(() => import('./admin_panel/pages/ProductAdd'));
const ProductManagement = lazy(() => import('./admin_panel/pages/ProductManagement'));
const PrivateRoute      = lazy(() => import('./admin_panel/admincomponents/PrivateRoute'));

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <RouteLoader />                           {/* ← show loader on every route-change */}
          <Suspense fallback={<RouteLoader />}>     {/* also fallback on initial chunk-load */}
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login"   element={<LoginPage />} />
              <Route path="/signup"  element={<SignupPage />} />
              <Route path="/adminlogin" element={<AdminLogin />} />

              {/* User Panel */}
              <Route path="/" element={<UserLayout />}>
                <Route index           element={<HomePage />} />
                <Route path="products" element={<UserProductList />} />
                <Route path="product/:productId" element={<ProductPage />} />
                <Route path="profile"  element={<ProfilePage />} />
                <Route path="cart"     element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders"   element={<OrdersPage />} />
                <Route path="order/:orderId" element={<OrderDetailPage />} />
                <Route path="wishlist" element={<div className="p-8 text-center">Wishlist coming soon!</div>} />
                <Route path="search"   element={<Navigate to="/products" replace />} />
              </Route>

              {/* Admin Panel */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route
                  path="dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="products"
                  element={
                    <PrivateRoute>
                      <ProductList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="products/add"
                  element={
                    <PrivateRoute>
                      <ProductAdd />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="products/edit/:productId"
                  element={
                    <PrivateRoute>
                      <ProductManagement />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="categories"
                  element={
                    <PrivateRoute>
                      <CategoryManagement />
                    </PrivateRoute>
                  }
                />
                {/* future admin features */}
                <Route
                  path="orders"
                  element={
                    <PrivateRoute>
                      <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Order Management</h2>
                        <p className="text-gray-600">Coming soon!</p>
                      </div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="customers"
                  element={
                    <PrivateRoute>
                      <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Customer Management</h2>
                        <p className="text-gray-600">Coming soon!</p>
                      </div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <PrivateRoute>
                      <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
                        <p className="text-gray-600">Coming soon!</p>
                      </div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <PrivateRoute>
                      <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Settings</h2>
                        <p className="text-gray-600">Coming soon!</p>
                      </div>
                    </PrivateRoute>
                  }
                />
              </Route>

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Page Not Found
                      </h2>
                      <p className="text-gray-600 mb-8">
                        The page you're looking for doesn't exist.
                      </p>
                      <div className="space-x-4">
                        <button
                          onClick={() => window.history.back()}
                          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Go Back
                        </button>
                        <button
                          onClick={() => (window.location.href = '/')}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Go Home
                        </button>
                      </div>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
               