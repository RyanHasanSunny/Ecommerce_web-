// src/user-panel/pages/CartPage.jsx - CORRECTED VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../api/api';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Heart,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  Loader,
  Tag,
  Truck,
  Shield,
  CreditCard
} from 'lucide-react';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getCart();
      
      console.log('Cart API response:', response);
      
      // Handle different possible response structures
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response.items && Array.isArray(response.items)) {
        items = response.items;
      } else if (response.cart && Array.isArray(response.cart.items)) {
        items = response.cart.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      setCartItems(items);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart items');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      const response = await apiService.updateCartItem(itemId, newQuantity);
      
      // Handle response and update local state
      if (response.success && response.cart) {
        const updatedItems = response.cart.items || [];
        setCartItems(updatedItems);
      } else {
        // Fallback: refetch cart
        await fetchCart();
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message || 'Failed to update quantity');
      
      // Show error for a few seconds
      setTimeout(() => setError(''), 5000);
      
      // Revert optimistic update by refetching
      fetchCart();
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Remove this item from your cart?')) return;

    setUpdating(true);
    try {
      const response = await apiService.removeFromCart(itemId);
      
      // Handle response
      if (response.items) {
        setCartItems(response.items);
      } else {
        // Fallback: refetch cart
        await fetchCart();
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Remove all items from your cart?')) return;

    setUpdating(true);
    try {
      await apiService.clearCart();
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdating(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      // Mock coupon validation - replace with actual API call
      const mockDiscount = couponCode.toUpperCase() === 'SAVE10' ? 10 : 0;
      
      if (mockDiscount > 0) {
        setAppliedCoupon(couponCode);
        setDiscount(mockDiscount);
        setCouponCode('');
      } else {
        setError('Invalid coupon code');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to apply coupon');
      setTimeout(() => setError(''), 3000);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    setDiscount(0);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // Get the price from the populated product or the item itself
      const product = item.productId || item.product || item;
      const price = product?.offerPrice || product?.sellingPrice || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * discount) / 100;
    return Math.max(0, subtotal - discountAmount);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your cart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>

          {/* Empty Cart */}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
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
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <span className="ml-4 text-gray-600">({cartItems.length} items)</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                <button
                  onClick={clearCart}
                  disabled={updating}
                  className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => {
                  // Handle different possible data structures
                  const product = item.productId || item.product || item;
                  const price = product?.offerPrice || product?.sellingPrice || item.price || 0;
                  const originalPrice = product?.sellingPrice || item.originalPrice || price;
                  const hasDiscount = product?.offerPrice && product.offerPrice < originalPrice;
                  const quantity = item.quantity || 1;
                  const itemId = item._id || item.id;

                  // Safety check to ensure we have required data
                  if (!product || !itemId) {
                    console.warn('Invalid cart item:', item);
                    return null;
                  }

                  return (
                    <div key={itemId} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={product.thumbnail || product.image || '/placeholder-product.jpg'}
                            alt={product.title || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                <Link
                                  to={`/product/${product._id || product.id}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {product.title || 'Unknown Product'}
                                </Link>
                              </h3>
                              {product.companyName && (
                                <p className="text-sm text-gray-600 mb-2">{product.companyName}</p>
                              )}
                              
                              {/* Price */}
                              <div className="flex items-center space-x-2 mb-3">
                                <span className="text-lg font-semibold text-gray-900">
                                  ${price.toFixed(2)}
                                </span>
                                {hasDiscount && (
                                  <>
                                    <span className="text-sm text-gray-500 line-through">
                                      ${originalPrice.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-green-600 font-medium">
                                      Save ${(originalPrice - price).toFixed(2)}
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Stock Status */}
                              {product.stock !== undefined && (
                                <>
                                  {product.stock <= 5 && product.stock > 0 && (
                                    <p className="text-sm text-orange-600 mb-2">
                                      Only {product.stock} left in stock!
                                    </p>
                                  )}
                                  {product.stock === 0 && (
                                    <p className="text-sm text-red-600 mb-2">Out of stock</p>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {/* Add to wishlist */}}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="Add to wishlist"
                              >
                                <Heart className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => removeItem(itemId)}
                                disabled={updating}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(itemId, quantity - 1)}
                                disabled={updating || quantity <= 1}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 font-medium min-w-[60px] text-center">
                                {updating ? '...' : quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(itemId, quantity + 1)}
                                disabled={updating || (product.stock !== undefined && quantity >= product.stock)}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                ${(price * quantity).toFixed(2)}
                              </p>
                              {hasDiscount && (
                                <p className="text-sm text-gray-500">
                                  You save ${((originalPrice - price) * quantity).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)} {/* Filter out null items */}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Apply
                  </button>
                </div>
                
                {appliedCoupon && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center text-green-600">
                      <Tag className="w-4 h-4 mr-1" />
                      <span>Code "{appliedCoupon}" applied</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-${((calculateSubtotal() * discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || updating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                Proceed to Checkout
              </button>

              {/* Security Features */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>Multiple payment options</span>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to="/products"
                  className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;