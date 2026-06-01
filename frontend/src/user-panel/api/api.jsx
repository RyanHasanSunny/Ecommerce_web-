// src/user-panel/api/api.js - UPDATED WITH ORDER MANAGEMENT AND COD PARTIAL PAYMENT

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const apiService = {
baseURL: import.meta.env.VITE_BACKEND_URL || '/api',

async request(endpoint, options = {}) {
  const url = `${this.baseURL}${endpoint}`;
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const sessionId = localStorage.getItem('guestSessionId');
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const config = { ...options, headers };

  // Include credentials to send cookies
  config.credentials = 'include';

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        // Handle admin logout on session expiration
        if (localStorage.getItem('adminToken')) {
          localStorage.removeItem('adminToken');
          window.location.href = '/adminlogin';
        }
      }

      throw new APIError(
        errorData.msg || errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    if (data?.session_id) localStorage.setItem('guestSessionId', data.session_id);
    if (data?.sessionId) localStorage.setItem('guestSessionId', data.sessionId);
    return normalizeApiData(data);
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new APIError('Network error', 0, { originalError: err.message });
  }
},


  // Authentication APIs
  async login(email, password, rememberMe = false) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe })
    });
  },

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        password_confirmation: userData.password_confirmation || userData.confirmPassword || userData.passwordConfirmation || userData.password
      })
    });
  },

  async getUserProfile() {
    return this.request('/auth/profile');
  },

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  },

  async updatePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPassword
      })
    });
  },

  // Product APIs
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/products${queryString ? `?${queryString}` : ''}`);
    return Array.isArray(response) ? response : (response.data || []);
  },

  async getProductById(id) {
    return this.request(`/products/${id}`);
  },

  async addProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(toLaravelProduct(productData))
    });
  },

  async updateHomePage(homePageData) {
    return this.request('/homepage', {
      method: 'PUT',
      body: JSON.stringify(toLaravelHomepage(homePageData))
      });
  },

  async getHomePage(homePageData) {
    return this.request('/homepage');
  },

  async updateProduct(productId, productData) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(toLaravelProduct(productData))
    });
  },

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE'
    });
  },

  // Category APIs
  async getCategories() {
    const response = await this.request('/categories');
    return Array.isArray(response) ? flattenCategories(response) : response;
  },

  async addCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(toLaravelCategory(categoryData))
    });
  },

  async removeCategory(categoryId) {
    return this.request(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  async updateCategory(categoryId, categoryData) {
    return this.request(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(toLaravelCategory(categoryData))
    });
  },

  // Cart APIs
  async addToCart(productId, quantity) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity })
    });
  },

  // Guest Cart APIs
  async addToGuestCart(productId, quantity) {
    return this.request('/guest/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, session_id: localStorage.getItem('guestSessionId') })
    });
  },

  async getGuestCart() {
    return this.request('/guest/cart');
  },

  async updateGuestCartItem(itemId, quantity) {
    return this.request(`/guest/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  async removeGuestItem(itemId) {
    return this.request(`/guest/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  },

  async clearGuestCart() {
    return this.request('/guest/cart', {
      method: 'DELETE'
    });
  },

  async applyGuestPromo(promoCode) {
    return this.request('/guest/cart/promo', {
      method: 'POST',
      body: JSON.stringify({ code: promoCode, session_id: localStorage.getItem('guestSessionId') })
    });
  },

  async removeGuestPromo() {
    return this.request('/guest/cart/promo', {
      method: 'DELETE'
    });
  },

  async getCart() {
    return this.request('/cart');
  },

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  async removeFromCart(itemId) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  },

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE'
    });
  },

  // Promo APIs
  async applyPromo(promoCode) {
    return this.request('/cart/promo', {
      method: 'POST',
      body: JSON.stringify({ code: promoCode })
    });
  },

  async removePromo() {
    return this.request('/cart/promo', {
      method: 'DELETE'
    });
  },

  async getPromoSetting() {
    const homePageData = await this.request('/homepage');
    return { promoEnabled: homePageData.promoEnabled || false };
  },

  // Admin Promo APIs
  async getAllPromos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/promos${queryString ? `?${queryString}` : ''}`);
  },

  async createPromo(promoData) {
    return this.request('/promos', {
      method: 'POST',
      body: JSON.stringify(toLaravelPromo(promoData))
    });
  },

  async updatePromo(id, promoData) {
    return this.request(`/promos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toLaravelPromo(promoData))
    });
  },

  async deletePromo(id) {
    return this.request(`/promos/${id}`, {
      method: 'DELETE'
    });
  },

  async togglePromoEnable(id, isEnabled) {
    return this.request(`/promos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isEnabled })
    });
  },

  // Order APIs - User
  async placeOrder(orderData) {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return this.request(token ? '/orders' : '/guest/orders', {
      method: 'POST',
      body: JSON.stringify(toLaravelOrder(orderData))
    });
  },

  async getUserOrders() {
    return this.request('/orders/my');
  },

  async getUserOrderById(orderId) {
    return this.request(`/orders/my/${orderId}`);
  },

  // NEW: Pay due amount for COD orders
  async payDueAmount(orderId, paymentData) {
    return this.request(`/orders/${orderId}/pay-due`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    });
  },

  // Order APIs - Admin
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/admin/orders${queryString ? `?${queryString}` : ''}`);
    return {
      ...response,
      orders: response.orders || response.data || []
    };
  },

  async getOrderById(orderId) {
    return this.request(`/admin/orders/${orderId}`);
  },

  async updateOrderStatus(orderId, statusData) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(toLaravelOrderStatus(statusData))
    });
  },

  async updatePaymentStatus(orderId, paymentData) {
    return this.request(`/admin/orders/${orderId}/payment`, {
      method: 'PUT',
      body: JSON.stringify(toLaravelPayment(paymentData))
    });
  },

  async getOrderStats() {
    return this.request('/admin/stats');
  },

  // NEW: Get orders with due payments (Admin)
  async getDuePayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  },

  // User APIs
  async getUserAddresses() {
    return this.request('/user/addresses');
  },

  async addAddress(addressData) {
    return this.request('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(toLaravelAddress(addressData))
    });
  },

  async getUserProducts() {
    return this.request('/user/products');
  },

  // Stats APIs (Admin)
  async getStats() {
    return this.request('/admin/stats');
  },

  // Admin Product APIs
  async getAdminProducts() {
    const response = await this.request('/products');
    return Array.isArray(response) ? response : (response.data || []);
  },

  // Image Upload APIs
  async uploadSingleImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const upload = await this.request('/uploads', {
      method: 'POST',
      body: formData,
      headers: {}
    });

    return {
      success: true,
      data: toLegacyUploadImage(upload),
      image: upload.image,
      url: upload.url,
    };
  },

  async uploadMultipleImages(imageFiles) {
    const uploads = [];
    for (const file of imageFiles) {
      uploads.push(await this.uploadSingleImage(file));
    }
    return { success: true, data: { images: uploads.map(toLegacyUploadImage) } };
  },

  async deleteImage(fileName) {
    const encodedFileName = encodeURIComponent(fileName);
    return this.request(`/uploads/${encodedFileName}`, {
      method: 'DELETE'
    });
  },

  async updateImage(oldFileName, newImageFile) {
    const formData = new FormData();
    formData.append('image', newImageFile);

    const encodedFileName = encodeURIComponent(oldFileName);
    return this.request('/uploads', {
      method: 'POST',
      body: formData,
      headers: {}
    });
  },

  async listImages(prefix = 'products/', maxKeys = 100) {
    return this.request(`/uploads?per_page=${maxKeys}`);
  },

  async getImageDetails(fileName) {
    const encodedFileName = encodeURIComponent(fileName);
    return this.request(`/uploads/${encodedFileName}`);
  },

  async testS3Connection() {
    return this.request('/uploads');
  }
};

const normalizeApiData = (value) => {
  if (Array.isArray(value)) return value.map(normalizeApiData);
  if (!value || typeof value !== 'object') return value;

  const normalized = {};
  for (const [key, item] of Object.entries(value)) {
    normalized[key] = normalizeApiData(item);
  }

  if (normalized.id !== undefined) normalized._id = normalized.id;
  if (normalized.created_at) normalized.createdAt = normalized.created_at;
  if (normalized.updated_at) normalized.updatedAt = normalized.updated_at;
  if (normalized.category_id) normalized.categoryId = normalized.category_id;
  if (normalized.parent_id) normalized.parentCategory = normalized.parent_id;
  if (normalized.parent_id !== undefined) normalized.isParent = !normalized.parent_id;
  if (normalized.sku) normalized.productId = normalized.sku;
  if (normalized.company_name) normalized.companyName = normalized.company_name;
  if (normalized.full_name) normalized.fullName = normalized.full_name;
  if (normalized.postal_code) {
    normalized.postalCode = normalized.postal_code;
    normalized.zipCode = normalized.postal_code;
  }
  if (normalized.unit_price !== undefined) normalized.price = toNumber(normalized.unit_price);
  if (normalized.expected_profit !== undefined) normalized.expectedProfit = toNumber(normalized.expected_profit);
  if (normalized.expected_profit !== undefined) normalized.profit = toNumber(normalized.expected_profit);
  if (normalized.delivery_charge !== undefined) normalized.deliveryCharge = toNumber(normalized.delivery_charge);
  if (normalized.selling_price !== undefined) normalized.sellingPrice = toNumber(normalized.selling_price);
  if (normalized.offer_value !== undefined) normalized.offerValue = toNumber(normalized.offer_value);
  if (normalized.final_price !== undefined) normalized.finalPrice = toNumber(normalized.final_price);
  if (normalized.unit_price !== undefined) normalized.unit_price = toNumber(normalized.unit_price);
  if (normalized.expected_profit !== undefined) normalized.expected_profit = toNumber(normalized.expected_profit);
  if (normalized.delivery_charge !== undefined) normalized.delivery_charge = toNumber(normalized.delivery_charge);
  if (normalized.selling_price !== undefined) normalized.selling_price = toNumber(normalized.selling_price);
  if (normalized.offer_value !== undefined) normalized.offer_value = toNumber(normalized.offer_value);
  if (normalized.final_price !== undefined) normalized.final_price = toNumber(normalized.final_price);
  if (normalized.stock !== undefined) normalized.stock = toNumber(normalized.stock);
  if (normalized.quantity !== undefined) normalized.quantity = toNumber(normalized.quantity);
  if (normalized.thumbnail_path !== undefined) normalized.thumbnail = normalized.thumbnail_path || null;
  if (normalized.thumbnail === '') normalized.thumbnail = null;
  if (normalized.image_paths) normalized.images = normalized.image_paths;
  if (Array.isArray(normalized.images)) normalized.images = normalized.images.filter(Boolean);
  if (normalized.sold_count !== undefined) normalized.soldCount = normalized.sold_count;
  if (normalized.search_count !== undefined) normalized.searchCount = normalized.search_count;
  if (normalized.payment_method) normalized.paymentMethod = normalized.payment_method;
  if (normalized.payment_status) normalized.paymentStatus = normalized.payment_status;
  if (normalized.payment_details) normalized.paymentDetails = normalized.payment_details;
  if (normalized.total_amount !== undefined) normalized.totalAmount = toNumber(normalized.total_amount);
  if (normalized.paid_amount !== undefined) normalized.paidAmount = toNumber(normalized.paid_amount);
  if (normalized.due_amount !== undefined) normalized.dueAmount = toNumber(normalized.due_amount);
  if (normalized.subtotal !== undefined) normalized.subtotal = toNumber(normalized.subtotal);
  if (normalized.total_price !== undefined) normalized.totalPrice = toNumber(normalized.total_price);
  if (normalized.total_price !== undefined) normalized.total_price = toNumber(normalized.total_price);
  if (normalized.discount_amount !== undefined) normalized.discountAmount = toNumber(normalized.discount_amount);
  if (normalized.discount_amount !== undefined) normalized.discount_amount = toNumber(normalized.discount_amount);
  if (normalized.delivery_charge !== undefined) normalized.deliveryCharge = toNumber(normalized.delivery_charge);
  if (normalized.shipping_address) normalized.shippingAddress = normalized.shipping_address;
  if (normalized.order_number) normalized.orderNumber = normalized.order_number;
  if (normalized.hero_panel) normalized.heroPanel = normalized.hero_panel;
  if (normalized.sliding_text) normalized.slidingText = normalized.sliding_text;
  if (normalized.top_header_text) normalized.topHeaderText = normalized.top_header_text;
  if (normalized.offer_panel) normalized.offerPanel = normalized.offer_panel;
  if (normalized.contact_info) normalized.contactInfo = normalized.contact_info;
  if (normalized.payment_info) normalized.paymentInfo = normalized.payment_info;
  if (normalized.promo_enabled !== undefined) normalized.promoEnabled = normalized.promo_enabled;
  if (normalized.terms_content !== undefined) normalized.termsAndConditions = { title: 'Terms and Conditions', content: normalized.terms_content || '' };
  if (normalized.privacy_content !== undefined) normalized.privacyPolicy = { title: 'Privacy Policy', content: normalized.privacy_content || '' };

  return normalized;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
};

const flattenCategories = (categories = []) => {
  const flat = [];
  for (const category of categories) {
    flat.push(category);
    if (Array.isArray(category.children)) {
      flat.push(...flattenCategories(category.children));
    }
  }
  return flat;
};

const toLaravelProduct = (product = {}) => ({
  category_id: product.category_id || product.categoryId || product.category,
  sku: product.sku || product.productId,
  title: product.title,
  company_name: product.company_name || product.companyName,
  description: product.description,
  specifications: product.specifications,
  unit_price: product.unit_price ?? product.price,
  expected_profit: product.expected_profit ?? product.expectedProfit ?? product.profit ?? 0,
  delivery_charge: product.delivery_charge ?? product.deliveryCharge ?? 0,
  offer_value: product.offer_value ?? product.offerValue ?? 0,
  stock: product.stock,
  thumbnail_path: product.thumbnail_path || product.thumbnail,
  image_paths: product.image_paths || product.images,
  is_active: product.is_active ?? true,
});

const toLaravelCategory = (category = {}) => ({
  parent_id: category.parent_id || category.parentCategory || null,
  name: category.name || category.categoryName,
  description: category.description || '',
  is_active: category.is_active ?? true,
});

const toLaravelHomepage = (home = {}) => ({
  hero_panel: home.hero_panel || home.heroPanel,
  sliding_text: home.sliding_text || home.slidingText,
  top_header_text: home.top_header_text || home.topHeaderText,
  offer_panel: home.offer_panel || home.offerPanel,
  contact_info: home.contact_info || home.contactInfo,
  payment_info: home.payment_info || home.paymentInfo,
  terms_content: home.terms_content || home.termsAndConditions?.content,
  privacy_content: home.privacy_content || home.privacyPolicy?.content,
  promo_enabled: home.promo_enabled ?? home.promoEnabled ?? false,
});

const toLaravelPromo = (promo = {}) => ({
  code: promo.code,
  discount_type: promo.discount_type || promo.discountType || 'fixed',
  discount_value: promo.discount_value ?? promo.discountValue ?? promo.discountAmount,
  minimum_order_amount: promo.minimum_order_amount ?? promo.minimumOrderAmount ?? 0,
  usage_limit: promo.usage_limit ?? promo.usageLimit,
  expires_at: promo.expires_at || promo.expiryDate,
  is_active: promo.is_active ?? promo.isEnabled ?? true,
});

const toLaravelOrder = (order = {}) => ({
  items: (order.items || []).map((item) => ({
    product_id: item.product_id || item.productId || item._id || item.id,
    quantity: item.quantity,
  })),
  shipping_address: toLaravelShippingAddress(order.shipping_address || order.shippingAddress || order.deliveryAddress),
  payment_method: order.payment_method || order.paymentMethod,
  transaction_id: order.transaction_id || order.transactionId,
  paid_amount: order.paid_amount ?? order.paidAmount,
  session_id: order.session_id || order.sessionId || localStorage.getItem('guestSessionId'),
  notes: order.notes,
});

const toLaravelShippingAddress = (address = {}) => ({
  full_name: address.full_name || address.fullName || address.name || 'Customer',
  phone: address.phone || address.contactNumber || '',
  address: address.address || '',
  city: address.city || '',
  postal_code: address.postal_code || address.postalCode || address.zipCode || '',
  country: address.country || 'Bangladesh',
});

const toLaravelOrderStatus = (status = {}) => ({
  status: status.status,
  tracking_number: status.tracking_number || status.trackingNumber,
  estimated_delivery_at: status.estimated_delivery_at || status.estimatedDelivery,
  cancel_reason: status.cancel_reason || status.note,
});

const toLaravelPayment = (payment = {}) => ({
  payment_status: payment.payment_status || payment.paymentStatus,
  paid_amount: payment.paid_amount ?? payment.paidAmount ?? payment.amount,
  transaction_id: payment.transaction_id || payment.transactionId,
});

const toLaravelAddress = (address = {}) => ({
  label: address.label,
  full_name: address.full_name || address.fullName || address.name || 'Customer',
  phone: address.phone || address.contactNumber || '',
  address: address.address,
  city: address.city,
  postal_code: address.postal_code || address.postalCode,
  country: address.country || 'Bangladesh',
  is_default: address.is_default ?? address.isDefault ?? false,
});

const toLegacyUploadImage = (upload) => {
  const image = upload.image || upload;
  const url = upload.url || image.url || image.path;
  return {
    originalName: image.original_name || image.originalName,
    mainImage: {
      fileName: image.id || image.fileName,
      url,
      path: image.path,
      size: image.size,
    },
    thumbnail: {
      fileName: image.id || image.fileName,
      url,
      path: image.thumbnail_path,
      size: image.size,
    },
  };
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
export const getCategoryById = (id) => apiService.getCategoryById(id);
export const removeCategory = (categoryId) => apiService.removeCategory(categoryId);
export const updateCategory = (categoryId, categoryData) => apiService.updateCategory(categoryId, categoryData);
export const addCategory = (categoryData) => apiService.addCategory(categoryData);

export const getUserAddresses = () => apiService.getUserAddresses();
export const addAddress = (addressData) => apiService.addAddress(addressData);
export const getUserProducts = () => apiService.getUserProducts();

export const getStats = () => apiService.getStats();
export const getAdminProducts = () => apiService.getAdminProducts();

// Cart exports
export const addToCart = (productId, quantity) => apiService.addToCart(productId, quantity);
export const getCart = () => apiService.getCart();
export const updateCartItem = (itemId, quantity) => apiService.updateCartItem(itemId, quantity);
export const removeFromCart = (itemId) => apiService.removeFromCart(itemId);
export const clearCart = () => apiService.clearCart();

// Guest Cart exports
export const addToGuestCart = (productId, quantity) => apiService.addToGuestCart(productId, quantity);
export const getGuestCart = () => apiService.getGuestCart();
export const updateGuestCartItem = (itemId, quantity) => apiService.updateGuestCartItem(itemId, quantity);
export const removeGuestItem = (itemId) => apiService.removeGuestItem(itemId);
export const clearGuestCart = () => apiService.clearGuestCart();
export const applyGuestPromo = (promoCode) => apiService.applyGuestPromo(promoCode);
export const removeGuestPromo = () => apiService.removeGuestPromo();

// Order exports - User
export const placeOrder = (orderData) => apiService.placeOrder(orderData);
export const getUserOrders = () => apiService.getUserOrders();
export const getUserOrderById = (orderId) => apiService.getUserOrderById(orderId);
export const payDueAmount = (orderId, paymentData) => apiService.payDueAmount(orderId, paymentData); // NEW

// Order exports - Admin
export const getAllOrders = (params) => apiService.getAllOrders(params);
export const getOrderById = (orderId) => apiService.getOrderById(orderId);
export const updateOrderStatus = (orderId, statusData) => apiService.updateOrderStatus(orderId, statusData);
export const updatePaymentStatus = (orderId, paymentData) => apiService.updatePaymentStatus(orderId, paymentData);
export const getOrderStats = () => apiService.getOrderStats();
export const getDuePayments = (params) => apiService.getDuePayments(params); // NEW

// Image exports
export const uploadSingleImage = (imageFile) => apiService.uploadSingleImage(imageFile);
export const uploadMultipleImages = (imageFiles) => apiService.uploadMultipleImages(imageFiles);
export const deleteImage = (fileName) => apiService.deleteImage(fileName);
export const updateImage = (oldFileName, newImageFile) => apiService.updateImage(oldFileName, newImageFile);
export const listImages = (prefix, maxKeys) => apiService.listImages(prefix, maxKeys);
export const getImageDetails = (fileName) => apiService.getImageDetails(fileName);
export const testS3Connection = () => apiService.testS3Connection();
export const getHomePage = () => apiService.getHomePage();
export const updateHomePage = (homePageData) => apiService.updateHomePage(homePageData);

// Promo exports - Admin
export const getAllPromos = (params) => apiService.getAllPromos(params);
export const createPromo = (promoData) => apiService.createPromo(promoData);
export const updatePromo = (id, promoData) => apiService.updatePromo(id, promoData);
export const deletePromo = (id) => apiService.deletePromo(id);
export const togglePromoEnable = (id, isEnabled) => apiService.togglePromoEnable(id, isEnabled);

export { APIError };
export default apiService;
