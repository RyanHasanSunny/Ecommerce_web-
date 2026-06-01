// components/orders/apiService.js
export const apiService = {
  authHeaders() {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`/api/admin/orders${queryString ? `?${queryString}` : ''}`, {
      headers: this.authHeaders()
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return {
      ...data,
      orders: (data.orders || data.data || []).map(normalizeOrder),
    };
  },

  async updateOrderStatus(orderId, statusData) {
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify({
        status: statusData.status,
        tracking_number: statusData.trackingNumber,
        estimated_delivery_at: statusData.estimatedDelivery,
        cancel_reason: statusData.note
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return normalizeOrder(await response.json());
  },

  async updatePaymentStatus(orderId, paymentData) {
    const response = await fetch(`/api/admin/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify({
        payment_status: paymentData.paymentStatus,
        paid_amount: paymentData.paidAmount ?? paymentData.amount,
        transaction_id: paymentData.transactionId
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return normalizeOrder(await response.json());
  },

  async getOrderStats() {
    const response = await fetch('/api/admin/stats', {
      headers: this.authHeaders()
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { ...data, stats: normalizeStats(data.stats || data) };
  },

  async getOrderById(orderId) {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      headers: this.authHeaders()
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return normalizeOrder(await response.json());
  }
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
};

const normalizeOrder = (order = {}) => ({
  ...order,
  _id: String(order._id ?? order.id ?? ''),
  orderId: order.orderId || order.order_number || order.orderNumber,
  userId: order.userId || order.user || null,
  shippingAddress: order.shippingAddress || order.shipping_address || {},
  paymentMethod: order.paymentMethod || order.payment_method,
  paymentStatus: order.paymentStatus || order.payment_status,
  paymentDetails: {
    ...(order.payment_details || {}),
    ...(order.paymentDetails || {}),
    transactionId: order.paymentDetails?.transactionId || order.payment_details?.transaction_id,
  },
  totalAmount: toNumber(order.totalAmount ?? order.total_amount),
  paidAmount: toNumber(order.paidAmount ?? order.paid_amount),
  dueAmount: toNumber(order.dueAmount ?? order.due_amount),
  subtotal: toNumber(order.subtotal),
  deliveryCharge: toNumber(order.deliveryCharge ?? order.delivery_charge),
  discountAmount: toNumber(order.discountAmount ?? order.discount_amount),
  totalProfit: toNumber(order.totalProfit ?? order.total_profit),
  totalNetProfit: toNumber(order.totalNetProfit ?? order.total_net_profit ?? order.net_profit),
  trackingNumber: order.trackingNumber || order.tracking_number,
  createdAt: order.createdAt || order.created_at,
  updatedAt: order.updatedAt || order.updated_at,
  items: (order.items || []).map((item) => ({
    ...item,
    _id: String(item._id ?? item.id ?? ''),
    productId: item.productId || item.product || item.product_id,
    finalPrice: toNumber(item.finalPrice ?? item.final_price),
    totalPrice: toNumber(item.totalPrice ?? item.total_price),
    quantity: toNumber(item.quantity),
  })),
});

const normalizeStats = (stats = {}) => ({
  ...stats,
  totalOrders: toNumber(stats.totalOrders ?? stats.total_orders),
  todayOrders: toNumber(stats.todayOrders ?? stats.today_orders),
  totalRevenue: toNumber(stats.totalRevenue ?? stats.total_revenue),
  totalProfit: toNumber(stats.totalProfit ?? stats.total_profit),
  totalNetProfit: toNumber(stats.totalNetProfit ?? stats.total_net_profit ?? stats.net_profit),
  pendingOrders: toNumber(stats.pendingOrders ?? stats.pending_orders),
});
