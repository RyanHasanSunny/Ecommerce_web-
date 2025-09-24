// src/user-panel/pages/OrderDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../api/api';
import {
  Package,
  ArrowLeft,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  RotateCcw,
  Star,
  Phone,
  Mail,
  Copy,
  AlertCircle,
  Loader
} from 'lucide-react';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, isAuthenticated, navigate]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching order with ID:', orderId);
      
      const response = await apiService.getUserOrderById(orderId);
      console.log('Order API response:', response);
      
      // Handle different response structures
      let orderData = null;
      if (response.order) {
        orderData = response.order;
      } else if (response.data) {
        orderData = response.data;
      } else if (response._id || response.orderId) {
        orderData = response;
      }
      
      if (!orderData) {
        throw new Error('Order data not found in response');
      }
      
      setOrder(orderData);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        description: 'Your order has been placed and is awaiting confirmation.',
        step: 1
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        description: 'Your order has been confirmed and is being prepared.',
        step: 2
      },
      processing: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Package,
        description: 'Your order is being processed and packed.',
        step: 3
      },
      shipped: {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Truck,
        description: 'Your order has been shipped and is on the way.',
        step: 4
      },
      delivered: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        description: 'Your order has been delivered successfully.',
        step: 5
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        description: 'Your order has been cancelled.',
        step: 0
      }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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
      const { fullName, address, city, zipCode, country, phone } = shippingAddress;
      const addressParts = [address, city, zipCode, country].filter(Boolean);
      return addressParts.join(', ');
    }
    
    return 'N/A';
  };

  // Helper function to get customer info from shipping address
  const getCustomerInfo = (shippingAddress, fallbackName = 'Customer') => {
    if (!shippingAddress) return { name: fallbackName, phone: null };
    
    if (typeof shippingAddress === 'object') {
      return {
        name: shippingAddress.fullName || fallbackName,
        phone: shippingAddress.phone || null
      };
    }
    
    return { name: fallbackName, phone: null };
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  const handleReorder = async () => {
    if (!order?.items || !Array.isArray(order.items)) {
      alert('No items found to reorder');
      return;
    }

    try {
      for (const item of order.items) {
        const productId = item.product?._id || item.productId || item.product;
        if (productId) {
          await apiService.addToCart(productId, item.quantity || 1);
        }
      }
      alert('Items added to cart successfully!');
      navigate('/cart');
    } catch (err) {
      console.error('Error reordering:', err);
      alert('Failed to add items to cart. Some items may no longer be available.');
    }
  };

  const downloadInvoice = () => {
    console.log('Downloading invoice for order:', order?._id || order?.orderId);
    alert('Invoice download feature will be implemented with backend integration.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The order you're looking for doesn't exist."}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go Back
              </button>
              <Link
                to="/orders"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order?.status || 'pending');
  const StatusIcon = statusConfig.icon;
  const customerInfo = getCustomerInfo(order?.shippingAddress, order?.customerName);

  const orderSteps = [
    { name: 'Order Placed', status: 'completed' },
    { name: 'Confirmed', status: statusConfig.step >= 2 ? 'completed' : 'pending' },
    { name: 'Processing', status: statusConfig.step >= 3 ? 'completed' : 'pending' },
    { name: 'Shipped', status: statusConfig.step >= 4 ? 'completed' : 'pending' },
    { name: 'Delivered', status: statusConfig.step >= 5 ? 'completed' : 'pending' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order?.orderId || order?._id?.slice(-8) || 'N/A'}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order?.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${statusConfig.color.replace('text-', 'text-white bg-').split(' ')[0]}`}>
                    <StatusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 capitalize">
                      {order?.status || 'Pending'}
                    </h2>
                    <p className="text-gray-600">{statusConfig.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => copyToClipboard(order?.orderId || order?._id || '')}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy ID
                  </button>
                  <button
                    onClick={downloadInvoice}
                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Invoice
                  </button>
                </div>
              </div>

              {/* Progress Steps */}
              {order?.status !== 'cancelled' && (
                <div className="mt-8">
                  <div className="flex items-center justify-between relative">
                    {orderSteps.map((step, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 ${
                          step.status === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step.status === 'completed' ? '✓' : index + 1}
                        </div>
                        <span className={`mt-2 text-sm font-medium text-center ${
                          step.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {step.name}
                        </span>
                      </div>
                    ))}
                    {/* Progress Line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0" />
                    <div 
                      className="absolute top-4 left-0 h-0.5 bg-green-600 -z-0 transition-all duration-500"
                      style={{ width: `${((statusConfig.step - 1) / (orderSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tracking Info */}
              {order?.status === 'shipped' && order?.trackingNumber && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Package Tracking</p>
                      <p className="text-blue-700">Tracking Number: {order?.trackingNumber}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {order?.items && Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item, index) => {
                    const product = item.product || item.productId || {};
                    const productId = product._id || product.id;
                    const productTitle = product.title || product.name || 'Unknown Product';
                    const productThumbnail = product.thumbnail || product.image || '/placeholder-product.jpg';
                    const productCompany = product.companyName || product.company;
                    const itemQuantity = item.quantity || 1;
                    const itemPrice = item.price || item.finalPrice || product.finalPrice || 0;

                    return (
                      <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={productThumbnail}
                              alt={productTitle}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {productId ? (
                              <Link
                                to={`/product/${productId}`}
                                className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors block"
                              >
                                {productTitle}
                              </Link>
                            ) : (
                              <h3 className="text-lg font-medium text-gray-900">
                                {productTitle}
                              </h3>
                            )}
                            
                            {productCompany && (
                              <p className="text-sm text-gray-600 mt-1">{productCompany}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Quantity: {itemQuantity}</span>
                              <span>Price: ৳ {Number(itemPrice).toFixed(2)}</span>
                            </div>

                            {order?.status === 'delivered' && (
                              <div className="mt-3">
                                <button className="flex items-center text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                                  <Star className="w-4 h-4 mr-1" />
                                  Rate & Review
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ৳ {(itemQuantity * itemPrice).toFixed(2)}
                            </p>
                            {order?.status === 'delivered' && productId && (
                              <button
                                onClick={() => apiService.addToCart(productId, itemQuantity)}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Buy Again
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No items found in this order</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            {order?.shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{customerInfo.name}</p>
                    <p className="text-gray-600 mt-1">{formatShippingAddress(order?.shippingAddress)}</p>
                    {(customerInfo.phone || order?.customerPhone) && (
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        {customerInfo.phone || order?.customerPhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({order?.items?.length || 0} items)</span>
                  <span>৳ {((order?.totalAmount || 0) - (order?.deliveryCharge || 0) - (order?.tax || 0)).toFixed(2)}</span>
                </div>

                {(order?.discount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳ {(order?.discount || 0).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{(order?.deliveryCharge || 0) > 0 ? `৳ ${(order?.deliveryCharge || 0).toFixed(2)}` : 'Free'}</span>
                </div>

                {(order?.tax || 0) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>৳ {(order?.tax || 0).toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Customer Paid</span>
                    <span>৳ {(order?.paidAmount || 0).toFixed(2)}</span>
                  </div>
                  {order?.dueAmount > 0 && (
                    <div className="flex justify-between text-orange-600 mt-1">
                      <span>Due Amount</span>
                      <span>৳ {order?.dueAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 capitalize">
                    {order?.paymentMethod || 'Credit Card'}
                  </span>
                </div>
                {order?.paymentStatus && (
                  <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order?.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order?.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                {order?.status === 'delivered' && (
                  <button
                    onClick={handleReorder}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reorder Items
                  </button>
                )}

                {['pending', 'confirmed'].includes(order?.status) && (
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </button>
                )}
              </div>

              {/* Need Help */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm text-gray-600">
    
                </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-600">{formatDate(order?.createdAt)}</p>
                    <p className="text-sm text-gray-500 mt-1">Your order has been received and is being processed.</p>
                  </div>
                </div>

                {order?.status !== 'pending' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Confirmed</p>
                      <p className="text-sm text-gray-600">{formatDate(order?.updatedAt || order?.createdAt)}</p>
                      <p className="text-sm text-gray-500 mt-1">We've confirmed your order and payment.</p>
                    </div>
                  </div>
                )}

                {['processing', 'shipped', 'delivered'].includes(order?.status) && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Processing</p>
                      <p className="text-sm text-gray-600">
                        {order?.processingDate ? formatDate(order.processingDate) : 'In progress'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Your order is being prepared for shipment.</p>
                    </div>
                  </div>
                )}

                {['shipped', 'delivered'].includes(order?.status) && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Shipped</p>
                      <p className="text-sm text-gray-600">
                        {order?.shippedDate ? formatDate(order.shippedDate) : 'Recently shipped'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Your package is on the way.
                        {order?.trackingNumber && ` Tracking: ${order.trackingNumber}`}
                      </p>
                    </div>
                  </div>
                )}

                {order?.status === 'delivered' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Delivered</p>
                      <p className="text-sm text-gray-600">
                        {order?.deliveredDate ? formatDate(order.deliveredDate) : 'Recently delivered'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Your package has been delivered successfully.</p>
                    </div>
                  </div>
                )}

                {order?.status === 'cancelled' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Cancelled</p>
                      <p className="text-sm text-gray-600">
                        {order?.cancelledDate ? formatDate(order.cancelledDate) : 'Recently cancelled'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        This order has been cancelled. 
                        {order?.cancellationReason && ` Reason: ${order.cancellationReason}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default OrderDetailPage;