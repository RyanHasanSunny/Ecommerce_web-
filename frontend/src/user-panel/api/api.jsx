// src/user-panel/api/api.js - UPDATED WITH CART UPDATE FUNCTIONALITY


class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const apiService = {
baseURL: import.meta.env.BACKEND_URL || '/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    // merge default headers with any passed headers
    // Only set JSON header when we're not sending a FormData
    const headers = { ...(options.headers || {}) };
    if (options.body && !(options.body instanceof FormData)) {
  headers['Content-Type'] = 'application/json';
    }
    const config = {
      ...options,
      headers
    };


    // Add auth token if available
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.msg || errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }
      return await response.json();
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError('Network error', 0, { originalError: err.message });
    }
  },


  // Authentication APIs
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async getUserProfile() {
    return this.request('/auth/profile');
  },

  async updatePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // Product APIs
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  },

  async getProductById(id) {
    return this.request(`/product/${id}`);
  },

  async addProduct(productData) {
    return this.request('/product', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(productId, productData) {
    return this.request(`/product/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(productId) {
    return this.request(`/product/${productId}`, {
      method: 'DELETE'
    });
  },

  // Category APIs
  async getCategories() {
    return this.request('/categories');
  },

  async addCategory(categoryData) {
    return this.request('/category', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  // Cart APIs - UPDATED WITH NEW METHOD
  async addToCart(productId, quantity) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },

  async getCart() {
    return this.request('/cart');
  },

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  async removeFromCart(itemId) {
    return this.request(`/cart/item/${itemId}`, {
      method: 'DELETE'
    });
  },

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE'
    });
  },

  // Order APIs
  async placeOrder(orderData) {
    return this.request('/orders/place', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async getUserOrders() {
    return this.request('/orders/my');
  },

  async getUserOrderById(orderId) {
    return this.request(`/orders/my/${orderId}`);
  },

  // User APIs
  async getUserAddresses() {
    return this.request('/user/addresses');
  },

  async addAddress(addressData) {
    return this.request('/user/address', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  },

  async getUserProducts() {
    return this.request('/user/products');
  },

  // Stats APIs (Admin)
  async getStats() {
    return this.request('/stats');
  },

  // Admin Product APIs
  async getAdminProducts() {
    return this.request('/products');
  },

  // Image Upload APIs
  async uploadSingleImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.request('/upload/single', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  },

  async uploadMultipleImages(imageFiles) {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    return this.request('/upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  },

  async deleteImage(fileName) {
    const encodedFileName = encodeURIComponent(fileName);
    return this.request(`/upload/${encodedFileName}`, {
      method: 'DELETE'
    });
  },

  async updateImage(oldFileName, newImageFile) {
    const formData = new FormData();
    formData.append('image', newImageFile);

    const encodedFileName = encodeURIComponent(oldFileName);
    return this.request(`/upload/update/${encodedFileName}`, {
      method: 'PUT',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  },

  async listImages(prefix = 'products/', maxKeys = 100) {
    return this.request(`/upload/list?prefix=${prefix}&maxKeys=${maxKeys}`);
  },

  async getImageDetails(fileName) {
    const encodedFileName = encodeURIComponent(fileName);
    return this.request(`/upload/details/${encodedFileName}`);
  },

  async testS3Connection() {
    return this.request('/upload/health');
  }
};

// Export individual functions for backward compatibility
export const loginUser = (email, password) => apiService.login(email, password);
export const registerUser = (userData) => apiService.register(userData);
export const getUserProfile = () => apiService.getUserProfile();
export const updatePassword = (currentPassword, newPassword) => apiService.updatePassword(currentPassword, newPassword);

export const getProducts = (params) => apiService.getProducts(params);
export const getProductById = (id) => apiService.getProductById(id);
export const addProduct = (productData) => apiService.addProduct(productData);
export const updateProduct = (productId, productData) => apiService.updateProduct(productId, productData);
export const deleteProduct = (productId) => apiService.deleteProduct(productId);

export const getCategories = () => apiService.getCategories();
export const addCategory = (categoryData) => apiService.addCategory(categoryData);

export const getUserAddresses = () => apiService.getUserAddresses();
export const addAddress = (addressData) => apiService.addAddress(addressData);
export const getUserProducts = () => apiService.getUserProducts();

export const getStats = () => apiService.getStats();
export const getAdminProducts = () => apiService.getAdminProducts();

// Updated cart exports
export const addToCart = (productId, quantity) => apiService.addToCart(productId, quantity);
export const getCart = () => apiService.getCart();
export const updateCartItem = (itemId, quantity) => apiService.updateCartItem(itemId, quantity);
export const removeFromCart = (itemId) => apiService.removeFromCart(itemId);
export const clearCart = () => apiService.clearCart();
export const getUserOrders = () => apiService.getUserOrders();

export const uploadSingleImage = (imageFile) => apiService.uploadSingleImage(imageFile);
export const uploadMultipleImages = (imageFiles) => apiService.uploadMultipleImages(imageFiles);
export const deleteImage = (fileName) => apiService.deleteImage(fileName);
export const updateImage = (oldFileName, newImageFile) => apiService.updateImage(oldFileName, newImageFile);
export const listImages = (prefix, maxKeys) => apiService.listImages(prefix, maxKeys);
export const getImageDetails = (fileName) => apiService.getImageDetails(fileName);
export const testS3Connection = () => apiService.testS3Connection();

export { APIError };
export default apiService;