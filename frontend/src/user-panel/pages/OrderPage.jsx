// src/user-panel/pages/OrdersPage.jsx - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../api/api';
import {
  Package,
  Search,
  Filter,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RotateCcw,
  Star,
  Download,
  AlertCircle,
  Loader,
  ArrowLeft,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: 0 },
    { value: 'pending', label: 'Pending', count: 0 },
    { value: 'confirmed', label: 'Confirmed', count: 0 },
    { value: 'processing', label: 'Processing', count: 0 },
    { value: 'shipped', label: 'Shipped', count: 0 },
    { value: 'delivered', label: 'Delivered', count: 0 },
    { value: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getUserOrders();
      
      // Handle different response structures
      let ordersList = [];
      if (Array.isArray(response)) {
        ordersList = response;
      } else if (response?.orders && Array.isArray(response.orders)) {
        ordersList = response.orders;
      } else if (response?.data && Array.isArray(response.data)) {
        ordersList = response.data;
      } else if (response && typeof response === 'object' && response.orders) {
        ordersList = response.orders;
      }

      console.log('Orders API response:', response);
      console.log('Processed orders list:', ordersList);
      
      setOrders(ordersList);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item?.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.productId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          filterDate.setMonth(now.getMonth() - 6);
          break;
        default:
          break;
      }
      
      if (dateRange !== 'all') {
        filtered = filtered.filter(order => 
          new Date(order.createdAt) >= filterDate
        );
      }
    }

    setFilteredOrders(filtered);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        description: 'Order placed, awaiting confirmation'
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        description: 'Order confirmed and being prepared'
      },
      processing: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Package,
        description: 'Order is being processed'
      },
      shipped: {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Truck,
        description: 'Order shipped and on the way'
      },
      delivered: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        description: 'Order delivered successfully'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        description: 'Order has been cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Helper function to format shipping address
  const formatShippingAddress = (shippingAddress) => {
    if (!shippingAddress) return 'N/A';
    
    // If it's already a string, return it
    if (typeof shippingAddress === 'string') {
      return shippingAddress;
    }
    
    // If it's an object, format it nicely
    if (typeof shippingAddress === 'object') {
      const { fullName, address, city, zipCode, country } = shippingAddress;
      const parts = [
        fullName,
        address,
        city,
        zipCode,
        country
      ].filter(Boolean); // Remove any undefined/null values
      
      return parts.join(', ');
    }
    
    return 'N/A';
  };

  // Helper function to get product data from item
  const getProductFromItem = (item) => {
    return item?.product || item?.productId || item;
  };

  const handleReorder = async (order) => {
    try {
      // Add all items from the order back to cart
      for (const item of order.items || []) {
        const product = getProductFromItem(item);
        if (product?._id) {
          await apiService.addToCart(product._id, item.quantity || 1);
        }
      }
      
      alert('Items added to cart successfully!');
      navigate('/cart');
    } catch (err) {
      console.error('Error reordering:', err);
      alert('Failed to add items to cart. Some items may no longer be available.');
    }
  };

  const downloadInvoice = (orderId) => {
    // Mock download - replace with actual API call
    console.log('Downloading invoice for order:', orderId);
    alert('Invoice download feature will be implemented with backend integration.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="6months">Last 6 Months</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </span>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status || 'pending');
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {/* Order Header */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.orderId || order._id?.slice(-8) || 'N/A'}
                            </h3>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigate(`/order/${order._id}`)}
                              className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </button>
                            
                            {order.status === 'delivered' && (
                              <button
                                onClick={() => handleReorder(order)}
                                className="flex items-center px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Reorder
                              </button>
                            )}
                            
                            <button
                              onClick={() => downloadInvoice(order._id)}
                              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Invoice
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Order Date:</span>
                            <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Amount:</span>
                            <p className="font-medium text-gray-900">৳{(order.totalAmount || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Items:</span>
                            <p className="font-medium text-gray-900">{order.items?.length || 0} items</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Payment:</span>
                            <p className="font-medium text-gray-900 capitalize">{order.paymentMethod || 'Card'}</p>
                          </div>
                        </div>

                        {/* Status Description */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{statusConfig.description}</p>
                          {order.status === 'shipped' && order.trackingNumber && (
                            <p className="text-sm text-blue-600 mt-1">
                              Tracking: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items?.slice(0, 3).map((item, index) => {
                            const product = getProductFromItem(item);
                            
                            return (
                              <div key={index} className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={product?.thumbnail || product?.image || '/placeholder-product.jpg'}
                                    alt={product?.title || 'Product'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = '/placeholder-product.jpg';
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product?.title || 'Unknown Product'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Qty: {item?.quantity || 1} × ৳{(item?.finalPrice || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  ৳{((item?.quantity || 1) * (item?.finalPrice || 0)).toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                          
                          {(order.items?.length || 0) > 3 && (
                            <button
                              onClick={() => navigate(`/order/${order._id}`)}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View all {order.items?.length} items
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          )}
                        </div>

                        {/* Delivery Address */}
                        {order.shippingAddress && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                                <p className="text-sm text-gray-600">{formatShippingAddress(order.shippingAddress)}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order Actions */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {order.status === 'delivered' && (
                              <button className="flex items-center text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                                <Star className="w-4 h-4 mr-1" />
                                Rate & Review
                              </button>
                            )}
                            
                            {['pending', 'confirmed'].includes(order.status || 'pending') && (
                              <button className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium">
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel Order
                              </button>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">Need help?</p>
                            <Link
                              to="/contact"
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Contact Support
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Load More / Pagination */}
            {filteredOrders.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;