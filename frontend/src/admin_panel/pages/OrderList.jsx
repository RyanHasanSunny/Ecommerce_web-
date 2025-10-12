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

// Payment Status Update Dialog (enhanced with total amount option and validation)
const PaymentStatusDialog = ({ open, onClose, order, onUpdate }) => {
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || '');
  const [transactionId, setTransactionId] = useState(order?.paymentDetails?.transactionId || '');
  const [amount, setAmount] = useState(order?.dueAmount || '');
  const [updateType, setUpdateType] = useState('dueAmount'); // 'dueAmount' or 'totalAmount'
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.paymentStatus);
      setTransactionId(order.paymentDetails?.transactionId || '');
      setAmount(updateType === 'dueAmount' ? (order.dueAmount || '') : (order.totalAmount || ''));
      setValidationError('');
    }
  }, [order, updateType]);

  const validateAmount = (value) => {
    const numValue = parseFloat(value) || 0;
    if (updateType === 'dueAmount') {
      const totalAmount = order?.totalAmount || 0;
      if (numValue > totalAmount) {
        return `Due amount cannot exceed total amount (৳${totalAmount.toLocaleString()})`;
      }
    }
    return '';
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    const error = validateAmount(value);
    setValidationError(error);
  };

  const handleUpdateTypeChange = (newType) => {
    setUpdateType(newType);
    setAmount(newType === 'dueAmount' ? (order?.dueAmount || '') : (order?.totalAmount || ''));
    setValidationError('');
  };

  const handleSubmit = async () => {
    if (validationError) {
      alert(validationError);
      return;
    }

    if (updateType === 'totalAmount') {
      setConfirmDialogOpen(true);
      return;
    }

    await performUpdate();
  };

  const performUpdate = async () => {
    setLoading(true);
    try {
      await apiService.updatePaymentStatus(order._id, {
        paymentStatus,
        transactionId: transactionId || undefined,
        amount: parseFloat(amount) || (updateType === 'dueAmount' ? order.dueAmount : order.totalAmount),
        updateType // Send the update type to backend
      });
      onUpdate();
      onClose();
      setConfirmDialogOpen(false);
    } catch (error) {
      alert(`Error updating payment status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Order Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.primary" gutterBottom>
                          <strong>Order ID:</strong> {order?._id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong> {new Date(order?.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Customer:</strong> {order?.userId?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Email:</strong> {order?.userId?.email || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Current Order Status:</strong>{' '}
                          <Chip 
                            label={order?.status} 
                            color={getStatusColor(order?.status)}
                            size="small" 
                          />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Current Payment Status:</strong>{' '}
                          <Chip 
                            label={order?.paymentStatus} 
                            color={getPaymentColor(order?.paymentStatus)}
                            size="small" 
                          />
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Current Due Amount:</strong> ৳{order?.dueAmount?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Total Amount:</strong> ৳{order?.totalAmount?.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Payment Update Details
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Payment Status</InputLabel>
                          <Select
                            value={paymentStatus}
                            label="Payment Status"
                            onChange={(e) => setPaymentStatus(e.target.value)}
                          >
                            <MenuItem value="unpaid">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label="Unpaid" color="error" size="small" />
                                <Typography variant="body2" color="text.secondary">
                                  Mark as unpaid
                                </Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="paid">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label="Paid" color="success" size="small" />
                                <Typography variant="body2" color="text.secondary">
                                  Mark as fully paid
                                </Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="refunded">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label="Refunded" color="warning" size="small" />
                                <Typography variant="body2" color="text.secondary">
                                  Issue refund
                                </Typography>
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Current: <Chip label={order?.paymentStatus} color={getPaymentColor(order?.paymentStatus)} size="small" />
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Transaction ID"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter transaction ID (optional)"
                          helperText={order?.paymentDetails?.transactionId ? `Current: ${order.paymentDetails.transactionId}` : 'No current transaction ID'}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Payment Date"
                          type="datetime-local"
                          defaultValue=""
                          InputLabelProps={{ shrink: true }}
                          helperText="Date when payment was received (optional)"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Amount Update
                    </Typography>
                    <Grid container spacing={2}>
                      {/* Update Type Toggle */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          What would you like to update?
                        </Typography>
                        <ToggleButtonGroup
                          value={updateType}
                          exclusive
                          onChange={(e, newType) => newType && handleUpdateTypeChange(newType)}
                          aria-label="update type"
                          fullWidth
                          sx={{ mb: 2 }}
                        >
                          <ToggleButton value="dueAmount" aria-label="due amount">
                            <Tooltip title="Update the remaining amount customer owes">
                              <span>Due Amount</span>
                            </Tooltip>
                          </ToggleButton>
                          <ToggleButton value="totalAmount" aria-label="total amount">
                            <Tooltip title="Update the entire order total (affects all calculations)">
                              <span>Total Amount</span>
                            </Tooltip>
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Current {updateType === 'dueAmount' ? 'Due Amount' : 'Total Amount'}:</strong>{' '}
                            <Chip 
                              label={`৳${updateType === 'dueAmount' ? order?.dueAmount?.toLocaleString() : order?.totalAmount?.toLocaleString()}`}
                              color="info" 
                              variant="outlined" 
                              size="small" 
                            />
                          </Typography>
                          {updateType === 'dueAmount' && (
                            <Typography variant="caption" color="text.secondary">
                              Updating due amount will adjust the remaining balance. Cannot exceed total amount (৳{order?.totalAmount?.toLocaleString()}).
                            </Typography>
                          )}
                          {updateType === 'totalAmount' && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                              <Typography variant="body2">
                                <strong>Warning:</strong> Updating total amount will recalculate profits, discounts, and due amounts across the entire order. This requires confirmation.
                              </Typography>
                            </Alert>
                          )}
                        </Box>

                        <Tooltip 
                          title={`Enter the new ${updateType === 'dueAmount' ? 'due amount' : 'total amount'}. Current value: ৳${updateType === 'dueAmount' ? order?.dueAmount?.toLocaleString() : order?.totalAmount?.toLocaleString()}`}
                          arrow
                        >
                          <TextField
                            fullWidth
                            label={`New ${updateType === 'dueAmount' ? 'Due Amount' : 'Total Amount'}`}
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            error={!!validationError}
                            helperText={validationError || `Updating from ৳${updateType === 'dueAmount' ? order?.dueAmount?.toLocaleString() : order?.totalAmount?.toLocaleString()}`}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                            }}
                            sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
                          />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !paymentStatus || !!validationError}
          >
            {loading ? 'Updating...' : 'Update Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Total Amount Updates */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Alert severity="warning" sx={{ p: 0 }} />
            Confirm Total Amount Update
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Important: This change will affect multiple aspects of the order
              </Typography>
              <Typography variant="body1">
                You are updating the total amount for Order <strong>{order?._id}</strong> from{' '}
                <strong>৳{order?.totalAmount?.toLocaleString()}</strong> to{' '}
                <strong>৳{parseFloat(amount)?.toLocaleString()}</strong>.
              </Typography>
            </Alert>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary.main">
                      Before Update
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Amount:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ৳{order?.totalAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Due Amount:</Typography>
                      <Typography variant="body2" fontWeight="bold" color={order?.dueAmount > 0 ? 'warning.main' : 'success.main'}>
                        ৳{order?.dueAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary.main">
                      After Update
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Amount:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ৳{parseFloat(amount)?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">New Due Amount:</Typography>
                      <Typography variant="body2" fontWeight="bold" color={Math.max(0, parseFloat(amount) - (order?.paidAmount || 0)) > 0 ? 'warning.main' : 'success.main'}>
                        ৳{Math.max(0, parseFloat(amount) - (order?.paidAmount || 0)).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.primary' }}>
              Impact of This Change:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 3 }}>
              <li><Typography variant="body2">The order's total value will be permanently updated</Typography></li>
              <li><Typography variant="body2">Revenue and profit calculations will be recalculated</Typography></li>
              <li><Typography variant="body2">Customer due amount will be adjusted based on payments received</Typography></li>
              <li><Typography variant="body2">All related reports and analytics will reflect this change</Typography></li>
              <li><Typography variant="body2" color="warning.main">This action cannot be undone</Typography></li>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Customer Notification:</strong> Consider notifying the customer about this change via email or SMS.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={performUpdate}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? 'Processing...' : 'Confirm & Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
                          color={getStatusColor(order.status)}
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography variant="body2"><strong>Payment:</strong> 
                        <Chip 
                          label={order.paymentStatus} 
                          color={getPaymentColor(order.paymentStatus)}
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

                      <Grid item xs={6}><Typography color="success.main">Net Profit:</Typography></Grid>
                      <Grid item xs={6}><Typography align="right" color="success.main" fontWeight="medium">৳{order.netProfit?.toLocaleString() || 'N/A'}</Typography></Grid>

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
                      <Grid item xs={6}><Typography variant="h6">Customer Paid:</Typography></Grid>
                      <Grid item xs={6}><Typography variant="h6" align="right">৳{order.paidAmount?.toLocaleString() || '0'}</Typography></Grid>
                      {order.dueAmount > 0 && (
                        <>
                          <Grid item xs={6}><Typography color="warning.main">Due Amount:</Typography></Grid>
                          <Grid item xs={6}><Typography align="right" color="warning.main">৳{order.dueAmount?.toLocaleString()}</Typography></Grid>
                        </>
                      )}
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


    const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f0f0f0',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardHoverStyle = {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  };

  const labelStyle = {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const valueStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px',
    lineHeight: '1.2'
  };

  const successValueStyle = {
    ...valueStyle,
    color: '#059669'
  };

  const captionStyle = {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '400'
  };

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
    padding: '0 8px'
  };

  const gradientOverlayStyle = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: '0.1',
    borderRadius: '0 16px 0 50px'
  };

  const iconContainerStyle = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  };

  const Card = ({ children, icon, iconBg, iconColor }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    return (
      <div
        style={{
          ...cardStyle,
          ...(isHovered ? cardHoverStyle : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={gradientOverlayStyle}></div>
        {icon && (
          <div style={{
            ...iconContainerStyle,
            backgroundColor: iconBg,
            color: iconColor
          }}>
            {icon}
          </div>
        )}
        {children}
      </div>
    );
  };








  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    alignItems: 'end'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };



  const inputStyle = {
    width: '100%',
    height: '48px',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'inherit'
  };

  const inputFocusStyle = {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px'
  };

  const searchContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const searchIconStyle = {
    position: 'absolute',
    left: '16px',
    color: '#6b7280',
    fontSize: '20px',
    pointerEvents: 'none',
    zIndex: 1
  };

  const clearIconStyle = {
    position: 'absolute',
    right: '16px',
    color: '#6b7280',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    zIndex: 1
  };

  const clearIconHoverStyle = {
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  const searchInputStyle = {
    ...inputStyle,
    paddingLeft: '48px',
    paddingRight: searchTerm ? '48px' : '16px'
  };

  const buttonStyle = {
    height: '48px',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  };

  const primaryButtonHoverStyle = {
    backgroundColor: '#2563eb',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    height: '44px'
  };

  const secondaryButtonHoverStyle = {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    color: '#374151'
  };

  const disabledButtonStyle = {
    opacity: '0.5',
    cursor: 'not-allowed'
  };

  const buttonGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '120px'
  };

  const [hoveredRefresh, setHoveredRefresh] = React.useState(false);
  const [hoveredClear, setHoveredClear] = React.useState(false);
  const [hoveredClearIcon, setHoveredClearIcon] = React.useState(false);
  const [focusedInput, setFocusedInput] = React.useState('');

  const isFiltersActive = searchTerm || statusFilter || paymentFilter;

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
<div style={containerStyle}>
      <Card 
        icon="📦"
        iconBg="#eff6ff"
        iconColor="#2563eb"
      >
        <div>
          <div style={labelStyle}>Total Orders</div>
          <div style={valueStyle}>{stats.totalOrders || 0}</div>
        </div>
      </Card>

      <Card 
        icon="🎯"
        iconBg="#f0fdf4"
        iconColor="#16a34a"
      >
        <div>
          <div style={labelStyle}>Today's Orders</div>
          <div style={valueStyle}>{stats.todayOrders || 0}</div>
        </div>
      </Card>

      <Card 
        icon="💰"
        iconBg="#fefce8"
        iconColor="#ca8a04"
      >
        <div>
          <div style={labelStyle}>Total Revenue</div>
          <div style={valueStyle}>৳{stats.totalRevenue?.toLocaleString() || 0}</div>
          <div style={captionStyle}>Customer Payments</div>
        </div>
      </Card>

      <Card
        icon="📈"
        iconBg="#f0fdf4"
        iconColor="#059669"
      >
        <div>
          <div style={labelStyle}>Total Profit</div>
          <div style={successValueStyle}>৳{stats.totalProfit?.toLocaleString() || 0}</div>
          <div style={captionStyle}>Gross Earnings</div>
        </div>
      </Card>

      <Card
        icon="💵"
        iconBg="#ecfdf5"
        iconColor="#10b981"
      >
        <div>
          <div style={labelStyle}>Net Profit</div>
          <div style={successValueStyle}>৳{stats.totalNetProfit?.toLocaleString() || 0}</div>
          <div style={captionStyle}>After Discounts</div>
        </div>
      </Card>

      <Card 
        icon="⏳"
        iconBg="#fef3c7"
        iconColor="#d97706"
      >
        <div>
          <div style={labelStyle}>Pending Orders</div>
          <div style={valueStyle}>{stats.pendingOrders || 0}</div>
        </div>
      </Card>
    </div>


      {/* Filters (no changes) */}
       <div style={containerStyle}>
      <div style={gridStyle}>
        {/* Search Field */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Search Orders</label>
          <div style={searchContainerStyle}>
            <span style={searchIconStyle}>🔍</span>
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, Email, or Transaction ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...searchInputStyle,
                ...(focusedInput === 'search' ? inputFocusStyle : {})
              }}
              onFocus={() => setFocusedInput('search')}
              onBlur={() => setFocusedInput('')}
            />
            {searchTerm && (
              <span
                style={{
                  ...clearIconStyle,
                  ...(hoveredClearIcon ? clearIconHoverStyle : {})
                }}
                onClick={() => setSearchTerm('')}
                onMouseEnter={() => setHoveredClearIcon(true)}
                onMouseLeave={() => setHoveredClearIcon(false)}
              >
                ✕
              </span>
            )}
          </div>
        </div>

        {/* Order Status Filter */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Order Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              ...selectStyle,
              ...(focusedInput === 'status' ? inputFocusStyle : {})
            }}
            onFocus={() => setFocusedInput('status')}
            onBlur={() => setFocusedInput('')}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Payment Status</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{
              ...selectStyle,
              ...(focusedInput === 'payment' ? inputFocusStyle : {})
            }}
            onFocus={() => setFocusedInput('payment')}
            onBlur={() => setFocusedInput('')}
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={buttonGroupStyle}>
          <button
            onClick={fetchOrders}
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              ...(hoveredRefresh && !loading ? primaryButtonHoverStyle : {}),
              ...(loading ? disabledButtonStyle : {})
            }}
            onMouseEnter={() => setHoveredRefresh(true)}
            onMouseLeave={() => setHoveredRefresh(false)}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
          
          <button
            onClick={handleClearFilters}
            disabled={!isFiltersActive}
            style={{
              ...secondaryButtonStyle,
              ...(hoveredClear && isFiltersActive ? secondaryButtonHoverStyle : {}),
              ...((!isFiltersActive) ? disabledButtonStyle : {})
            }}
            onMouseEnter={() => setHoveredClear(true)}
            onMouseLeave={() => setHoveredClear(false)}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

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

              <TableCell>Price</TableCell>
              <TableCell>Delivery Charge</TableCell>
              <TableCell>Customer Paid</TableCell>
              <TableCell>Due Amount</TableCell>
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
                    <Typography variant="body2" fontWeight="medium" color="primary.main">
                      ৳{order.subtotal?.toLocaleString() || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      With Discount
                    </Typography>
                  </TableCell>
                  {/* <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      ৳{order.totalProfit?.toLocaleString() || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Net Profit
                    </Typography>
                  </TableCell> */}
                  {/* <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="error.main">
                      ৳{order.totalOfferValue?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Discount Given
                    </Typography>
                  </TableCell> */}
                   <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ৳{order.deliveryCharge?.toLocaleString()}
                    </Typography>
                  </TableCell>
                   <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      ৳{order.paidAmount?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Customer Paid
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.dueAmount > 0 ? (
                      <Typography variant="body2" fontWeight="medium" color="warning.main">
                        ৳{order.dueAmount?.toLocaleString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                    {order.dueAmount > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Due
                      </Typography>
                    )}
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