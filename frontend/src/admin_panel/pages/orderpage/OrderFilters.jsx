import React from "react";
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Stack, Button, Paper, IconButton } from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

const OrderFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, paymentFilter, setPaymentFilter, fetchOrders, handleClearFilters, loading }) => (
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
            startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
            endAdornment: searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm("")}>
                <ClearIcon />
              </IconButton>
            ),
          }}
        />
      </Grid>
      {/* Order Status */}
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel>Order Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {/* Payment Filter */}
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel>Payment Status</InputLabel>
          <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
            <MenuItem value="">All Payments</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {/* Buttons */}
      <Grid item xs={12} md={2}>
        <Stack spacing={1}>
          <Button variant="outlined" onClick={fetchOrders} disabled={loading} sx={{ height: 56 }}>
            Refresh
          </Button>
          <Button variant="text" onClick={handleClearFilters} size="small" disabled={!searchTerm && !statusFilter && !paymentFilter}>
            Clear Filters
          </Button>
        </Stack>
      </Grid>
    </Grid>
  </Paper>
);

export default OrderFilters;
