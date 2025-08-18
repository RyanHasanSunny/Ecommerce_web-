// components/orders/apiService.js
export const apiService = {
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

    const response = await fetch(`/api/orders/admin/all${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async updateOrderStatus(orderId, statusData) {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const response = await fetch(`/api/orders/admin/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(statusData)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async updatePaymentStatus(orderId, paymentData) {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const response = await fetch(`/api/orders/admin/${orderId}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getOrderStats() {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const response = await fetch('/api/orders/admin/stats', {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getOrderById(orderId) {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const response = await fetch(`/api/orders/admin/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }
};
