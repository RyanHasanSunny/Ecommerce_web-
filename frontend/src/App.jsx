// src/App.jsx - UPDATED VERSION

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './user-panel/context/AuthContext';
import { Loader } from 'lucide-react';
import RouteLoader from './RouteLoader';
import ScrollToTop from './ScrollToTop';
import InitialLoader from './InitialLoader';
import { AppDataProvider } from './AppDataContext';
import { getCategories } from './user-panel/api/api';
import apiService from './user-panel/api/api';
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
const ForgotPassword  = lazy(() => import('./user-panel/pages/ForgotPassword'));
const ResetPassword   = lazy(() => import('./user-panel/pages/ResetPassword'));
const ProfilePage     = lazy(() => import('./user-panel/pages/profile_page'));
const CartPage        = lazy(() => import('./user-panel/pages/CartPage'));
const CheckoutPage    = lazy(() => import('./user-panel/components/paymentModal/PaymentModal'));
const OrdersPage      = lazy(() => import('./user-panel/pages/OrderPage'));
const OrderDetailPage = lazy(() => import('./user-panel/pages/OrderDetailPage'));
const TermsandConditions = lazy(() => import('./user-panel/pages/TermsandConditions'));
const PrivacyPolicy = lazy(() => import('./user-panel/pages/PrivacyPolicy'));
const ContactUs = lazy(() => import('./user-panel/pages/ContactUs'));
const NotFound = lazy(() => import('./user-panel/pages/NotFound'));

// -- lazily imported admin-panel pages
const AdminLogin        = lazy(() => import('./admin_panel/pages/Login'));
const AdminLayout       = lazy(() => import('./admin_panel/pages/AdminLayout'));
const Dashboard         = lazy(() => import('./admin_panel/pages/Dashboard'));
const CategoryManagement= lazy(() => import('./admin_panel/pages/CategoryManagement'));
const ProductList       = lazy(() => import('./admin_panel/pages/ProductList'));
const ProductAdd        = lazy(() => import('./admin_panel/pages/ProductAdd'));
const ProductManagement = lazy(() => import('./admin_panel/pages/ProductManagement'));
const PrivateRoute      = lazy(() => import('./admin_panel/admincomponents/PrivateRoute'));
const HomepageManagement= lazy(() => import('./admin_panel/pages/HomepageManagement'));
const OrderManagement   = lazy(() => import('./admin_panel/pages/OrderList'));

function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState({ categories: [], homePageData: null });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await getCategories();
        const categories = Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse.categories || [];
        const parentCategories = categories.filter(cat => cat.isParent);

        // Fetch homepage data
        const homePageResponse = await apiService.getHomePage();
        const homePageData = homePageResponse.data || homePageResponse;

        setInitialData({ categories: parentCategories, homePageData });
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Continue with empty data if fetch fails
        setInitialData({ categories: [], homePageData: null });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (initialLoading) {
    return <InitialLoader />;
  }

  return (
    <div className="App">
      <AppDataProvider initialData={initialData}>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <RouteLoader />                           {/* ← show loader on every route-change */}
            <Suspense fallback={<RouteLoader />}>     {/* also fallback on initial chunk-load */}
              <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/signup"          element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password"  element={<ResetPassword />} />
              <Route path="/adminlogin"      element={<AdminLogin />} />

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
                <Route path="terms" element={<TermsandConditions />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="contact" element={<ContactUs />} />
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
                    <OrderManagement/>
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
                      <HomepageManagement/>
                    </PrivateRoute>
                  }
                />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
      </AppDataProvider>
    </div>
  );
}

export default App;
               