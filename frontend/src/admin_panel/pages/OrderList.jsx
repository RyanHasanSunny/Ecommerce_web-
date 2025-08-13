import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Button,
  Paper,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Stack,
  Avatar,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  LinearProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  NavigateNext as NavigateNextIcon,
  Receipt as ReceiptIcon,
  Update as UpdateIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as TruckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// API Service (same as before - no changes needed)
const apiService = {
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    const response = await fetch(`/api/orders/admin/all${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
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
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
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
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
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
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
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
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  }
};

// Order Status Update Dialog (no changes needed)
const OrderStatusDialog = ({ open, onClose, order, onUpdate }) => {
  const [status, setStatus] = useState(order?.status || '');
  const [note, setNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTrackingNumber(order.trackingNumber || '');
      setNote('');
      setEstimatedDelivery('');
    }
  }, [order]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiService.updateOrderStatus(order._id, {
        status,
        note,
        trackingNumber: trackingNumber || undefined,
        estimatedDelivery: estimatedDelivery || undefined
      });
      onUpdate();
      onClose();
    } catch (error) {
      alert(`Error updating order status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'processing', label: 'Processing', color: 'info' },
    { value: 'shipped', label: 'Shipped', color: 'primary' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UpdateIcon />
          Update Order Status
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order ID: {order?._id}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={status}
                  label="Order Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={option.label}
                          color={option.color}
                          size="small"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Status Update Note"
                multiline
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this status update..."
              />
            </Grid>

            {(status === 'shipped' || status === 'delivered') && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tracking Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Estimated Delivery"
                    type="datetime-local"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !status || !note}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Payment Status Update Dialog (no changes needed)
const PaymentStatusDialog = ({ open, onClose, order, onUpdate }) => {
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || '');
  const [transactionId, setTransactionId] = useState(order?.paymentDetails?.transactionId || '');
  const [amount, setAmount] = useState(order?.totalAmount || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.paymentStatus);
      setTransactionId(order.paymentDetails?.transactionId || '');
      setAmount(order.totalAmount);
    }
  }, [order]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiService.updatePaymentStatus(order._id, {
        paymentStatus,
        transactionId: transactionId || undefined,
        amount: parseFloat(amount) || order.totalAmount
      });
      onUpdate();
      onClose();
    } catch (error) {
      alert(`Error updating payment status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoneyIcon />
          Update Payment Status
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order ID: {order?._id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Amount: ৳{order?.totalAmount?.toLocaleString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatus}
                  label="Payment Status"
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <MenuItem value="unpaid">
                    <Chip label="Unpaid" color="error" size="small" />
                  </MenuItem>
                  <MenuItem value="paid">
                    <Chip label="Paid" color="success" size="small" />
                  </MenuItem>
                  <MenuItem value="refunded">
                    <Chip label="Refunded" color="warning" size="small" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !paymentStatus}
        >
          {loading ? 'Updating...' : 'Update Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// UPDATED Order Detail Dialog with new pricing structure
const OrderDetailDialog = ({ open, onClose, orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
    }
  }, [open, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await apiService.getOrderById(orderId);
      setOrder(response.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <LinearProgress />
            <Typography sx={{ mt: 2 }}>Loading order details...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          Order Details
        </Box>
      </DialogTitle>
      <DialogContent>
        {order && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Order Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Order Information</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2"><strong>Order ID:</strong> {order._id}</Typography>
                      <Typography variant="body2"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</Typography>
                      <Typography variant="body2"><strong>Status:</strong> 
                        <Chip 
                          label={order.status} 
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'error' :
                            order.status === 'shipped' ? 'primary' : 'warning'
                          }
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography variant="body2"><strong>Payment:</strong> 
                        <Chip 
                          label={order.paymentStatus} 
                          color={order.paymentStatus === 'paid' ? 'success' : 'error'}
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      {order.paymentDetails?.transactionId && (
                        <Typography variant="body2"><strong>Transaction ID:</strong> 
                          <Typography component="span" variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginLeft: 1,
                            fontSize: '0.875rem'
                          }}>
                            {order.paymentDetails.transactionId}
                          </Typography>
                        </Typography>
                      )}
                      {order.paymentDetails?.paidAt && (
                        <Typography variant="body2"><strong>Payment Date:</strong> {new Date(order.paymentDetails.paidAt).toLocaleDateString()}</Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Customer Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Customer Information</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2"><strong>Name:</strong> {order.userId?.name}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {order.userId?.email}</Typography>
                      <Typography variant="body2"><strong>Phone:</strong> {order.userId?.phone}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Shipping Address */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                    <Typography variant="body2">
                      {order.shippingAddress.fullName}<br />
                      {order.shippingAddress.phone}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Order Items - UPDATED with new pricing structure */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Order Items</Typography>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Qty</TableCell>
                          <TableCell>Unit Price</TableCell>
                          <TableCell>Profit</TableCell>
                          <TableCell>Delivery</TableCell>
                          <TableCell>Selling Price</TableCell>
                          <TableCell>Offer Value</TableCell>
                          <TableCell>Final Price</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.items?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {item.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={item.quantity} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                ৳{item.unitPrice?.toLocaleString() || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="success.main">
                                ৳{item.profit?.toLocaleString() || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="info.main">
                                ৳{item.deliveryCharge?.toLocaleString() || '0'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary.main" fontWeight="medium">
                                ৳{item.sellingPrice?.toLocaleString() || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="error.main">
                                ৳{item.offerValue?.toLocaleString() || '0'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium" color="secondary.main">
                                ৳{item.finalPrice?.toLocaleString() || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                ৳{item.totalPrice?.toLocaleString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* UPDATED Revenue Breakdown */}
                    <Typography variant="h6" gutterBottom color="primary">
                      Revenue Breakdown
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}><Typography color="text.secondary">Total Unit Price:</Typography></Grid>
                      <Grid item xs={6}><Typography align="right" fontWeight="medium">৳{order.totalUnitPrice?.toLocaleString() || 'N/A'}</Typography></Grid>
                      
                      <Grid item xs={6}><Typography color="success.main">Total Profit:</Typography></Grid>
                      <Grid item xs={6}><Typography align="right" color="success.main" fontWeight="medium">৳{order.totalProfit?.toLocaleString() || 'N/A'}</Typography></Grid>
                      
                      <Grid item xs={6}><Typography color="info.main">Product Delivery Charges:</Typography></Grid>
                      <Grid item xs={6}><Typography align="right" color="info.main" fontWeight="medium">৳{order.totalProductDeliveryCharge?.toLocaleString() || 'N/A'}</Typography></Grid>
                      
                      <Grid item xs={6}><Typography color="primary.main">Total Selling Price:</Typography></Grid>
                      <Grid item xs={6}><Typography align="right" color="primary.main" fontWeight="medium">৳{order.totalSellingPrice?.toLocaleString() || 'N/A'}</Typography></Grid>
                      
                      <Grid item xs={6}><Typography color="error.main">Total Offer Value (Discount):</Typography></Grid>
                      <Grid item xs={6}><Typography align="right" color="error.main" fontWeight="medium">৳{order.totalOfferValue?.toLocaleString() || 'N/A'}</Typography></Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />
                    
                    {/* Order Summary */}
                    <Typography variant="h6" gutterBottom>
                      Order Summary
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}><Typography>Subtotal (Final Prices):</Typography></Grid>
                      <Grid item xs={6}><Typography align="right">৳{order.subtotal?.toLocaleString()}</Typography></Grid>
                      <Grid item xs={6}><Typography>Order Delivery Charge:</Typography></Grid>
                      <Grid item xs={6}><Typography align="right">৳{order.deliveryCharge?.toLocaleString()}</Typography></Grid>
                      <Grid item xs={6}><Typography>Extra Charge:</Typography></Grid>
                      <Grid item xs={6}><Typography align="right">৳{order.extraCharge?.toLocaleString()}</Typography></Grid>
                      <Grid item xs={6}><Typography variant="h6">Customer Pays:</Typography></Grid>
                      <Grid item xs={6}><Typography variant="h6" align="right">৳{order.totalAmount?.toLocaleString()}</Typography></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// UPDATED Main OrderList Component
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      
      const response = await apiService.getAllOrders(params);
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getOrderStats();
      setStats(response.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setStatusDialogOpen(true);
  };

  const handlePaymentUpdate = (order) => {
    setSelectedOrder(order);
    setPaymentDialogOpen(true);
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setDetailDialogOpen(true);
  };

  const handleUpdateComplete = () => {
    fetchOrders();
    fetchStats();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPaymentFilter('');
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.paymentDetails?.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'shipped': return 'primary';
      case 'processing': return 'info';
      default: return 'warning';
    }
  };

  const getPaymentColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid': return 'success';
      case 'refunded': return 'warning';
      default: return 'error';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Loading orders...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Button variant="text" onClick={() => navigate('/admin')}>
            Admin
          </Button>
          <Typography color="text.primary">Orders</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
          Order Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all customer orders with detailed pricing breakdown
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Orders</Typography>
              <Typography variant="h5">{stats.totalOrders || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Today's Orders</Typography>
              <Typography variant="h5">{stats.todayOrders || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Revenue</Typography>
              <Typography variant="h5">৳{stats.totalRevenue?.toLocaleString() || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Customer Payments</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Profit</Typography>
              <Typography variant="h5" color="success.main">৳{stats.totalProfit?.toLocaleString() || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Net Earnings</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Pending Orders</Typography>
              <Typography variant="h5">{stats.pendingOrders || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* UPDATED Revenue Breakdown Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                💰 Selling Price Revenue
              </Typography>
              <Typography variant="h4" color="primary.main">
                ৳{stats.totalSellingPrice?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total from all selling prices (before discounts)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                🎯 Total Discounts
              </Typography>
              <Typography variant="h4" color="error.main">
                ৳{stats.totalOfferValue?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total discount amount given to customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="info">
                🚚 Product Delivery Charges
              </Typography>
              <Typography variant="h4" color="info.main">
                ৳{stats.totalProductDeliveryCharge?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Product-specific delivery charges
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="success">
                📈 Profit Margin
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.profitMargin ? `${stats.profitMargin.toFixed(1)}%` : '0%'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average profit percentage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters (no changes) */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Orders"
              placeholder="Search by Order ID, Customer Name, Email, or Transaction ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Order Status</InputLabel>
              <Select
                value={statusFilter}
                label="Order Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={paymentFilter}
                label="Payment Status"
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <MenuItem value="">All Payments</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                onClick={fetchOrders}
                disabled={loading}
                sx={{ height: 56 }}
              >
                Refresh
              </Button>
              <Button
                variant="text"
                onClick={handleClearFilters}
                size="small"
                disabled={!searchTerm && !statusFilter && !paymentFilter}
              >
                Clear Filters
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* UPDATED Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Final Total</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell>Profit</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {order._id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {order.userId?.name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.userId?.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentStatus}
                      color={getPaymentColor(order.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.paymentDetails?.transactionId ? (
                      <Typography variant="body2" fontFamily="monospace" sx={{ 
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        fontSize: '0.75rem'
                      }}>
                        {order.paymentDetails.transactionId}
                      </Typography>
                    ) : (
                      <Chip 
                        label="No Transaction ID" 
                        size="small" 
                        variant="outlined" 
                        color="default"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ৳{order.totalAmount?.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Customer Paid
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="primary.main">
                      ৳{order.totalSellingPrice?.toLocaleString() || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Before Discount
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      ৳{order.totalProfit?.toLocaleString() || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Net Profit
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="error.main">
                      ৳{order.totalOfferValue?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Discount Given
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewDetails(order._id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleStatusUpdate(order)}
                        >
                          <UpdateIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Payment">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePaymentUpdate(order)}
                        >
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredOrders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      {/* Dialogs */}
      <OrderStatusDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        order={selectedOrder}
        onUpdate={handleUpdateComplete}
      />

      <PaymentStatusDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        order={selectedOrder}
        onUpdate={handleUpdateComplete}
      />

      <OrderDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        orderId={selectedOrderId}
      />
    </Box>
  );
};

export default OrderList;