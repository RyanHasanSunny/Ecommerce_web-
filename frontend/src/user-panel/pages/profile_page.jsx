// src/user-panel/pages/profile_page.jsx - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../api/api';
import { 
  User, 
  Mail, 
  Shield, 
  MapPin, 
  Package, 
  Settings,
  Edit,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const ProfilePage = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Forms
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });
  
  const [addressForm, setAddressForm] = useState({
    address: '',
    isEditing: false,
    editIndex: -1
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch user data on mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      const [addressesResponse, ordersResponse] = await Promise.all([
        apiService.getUserAddresses().catch(() => []),
        apiService.getUserOrders().catch(() => ({ orders: [] }))
      ]);

      setAddresses(addressesResponse || []);
      setOrders(ordersResponse.orders || ordersResponse || []);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await apiService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setSuccess('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!addressForm.address.trim()) {
      setError('Address cannot be empty');
      return;
    }

    try {
      setLoading(true);
      
      if (addressForm.isEditing) {
        // Update existing address (if API supports it)
        const updatedAddresses = [...addresses];
        updatedAddresses[addressForm.editIndex].address = addressForm.address.trim();
        setAddresses(updatedAddresses);
        setSuccess('Address updated successfully!');
      } else {
        // Add new address
        const newAddress = await apiService.addAddress({ address: addressForm.address.trim() });
        setAddresses(prev => [...prev, newAddress]);
        setSuccess('Address added successfully!');
      }
      
      // Reset form
      setAddressForm({
        address: '',
        isEditing: false,
        editIndex: -1
      });
    } catch (err) {
      setError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (index) => {
    setAddressForm({
      address: addresses[index].address,
      isEditing: true,
      editIndex: index
    });
  };

  const handleDeleteAddress = (index) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      setAddresses(updatedAddresses);
      setSuccess('Address deleted successfully!');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  // Show loading state
  if (!user && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'User'}</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg mb-8 shadow-sm overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto flex-shrink-0 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Success</h4>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto flex-shrink-0 text-green-600 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.name || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      {user?.email || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="capitalize">{user?.role || 'user'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="pt-4 border-t border-gray-200">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order History
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div 
                      key={order._id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.orderId}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            ${order.totalAmount}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/order/${order._id}`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            View Details
                          </Link>
                          
                          {order.status === 'delivered' && (
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                  <p className="text-gray-600 mb-4">Start shopping to see your orders here!</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Saved Addresses
                </h2>
              </div>

              {/* Add/Edit Address Form */}
              <form onSubmit={handleAddressSubmit} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Enter your address..."
                    value={addressForm.address}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : addressForm.isEditing ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>{addressForm.isEditing ? 'Update' : 'Add'} Address</span>
                  </button>
                  {addressForm.isEditing && (
                    <button
                      type="button"
                      onClick={() => setAddressForm({ address: '', isEditing: false, editIndex: -1 })}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
              
              {/* Address List */}
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-900">{addr.address}</p>
                          <p className="text-xs text-gray-500 mt-1">Address {index + 1}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditAddress(index)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                          aria-label="Edit address"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(index)}
                          className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Addresses Saved</h3>
                  <p className="text-gray-600">Add an address above to get started!</p>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Password & Security
              </h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordForm.showCurrent ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setPasswordForm(prev => ({ ...prev, showCurrent: !prev.showCurrent }))}
                    >
                      {passwordForm.showCurrent ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordForm.showNew ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setPasswordForm(prev => ({ ...prev, showNew: !prev.showNew }))}
                    >
                      {passwordForm.showNew ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-600">Password strength:</div>
                      <div className="flex space-x-1">
                        <div className={`h-1 w-full rounded ${passwordForm.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-1 w-full rounded ${/(?=.*[a-z])(?=.*[A-Z])/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-1 w-full rounded ${/(?=.*\d)/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordForm.showConfirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setPasswordForm(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                    >
                      {passwordForm.showConfirm ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </form>

              {/* Security Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Security Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use a strong password with at least 8 characters</li>
                  <li>• Include uppercase and lowercase letters, numbers, and symbols</li>
                  <li>• Don't reuse passwords from other accounts</li>
                  <li>• Change your password regularly</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;