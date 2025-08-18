// components/orders/OrderStatusDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Grid, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Chip
} from "@mui/material";
import { Update as UpdateIcon } from "@mui/icons-material";
import { apiService } from "./apiService";

const OrderStatusDialog = ({ open, onClose, order, onUpdate }) => {
  const [status, setStatus] = useState(order?.status || "");
  const [note, setNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTrackingNumber(order.trackingNumber || "");
      setNote("");
      setEstimatedDelivery("");
    }
  }, [order]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiService.updateOrderStatus(order._id, {
        status,
        note,
        trackingNumber: trackingNumber || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
      });
      onUpdate();
      onClose();
    } catch (error) {
      alert(`Error updating order status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UpdateIcon />
          Update Order Status
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Same content as before */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !status || !note}>
          {loading ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderStatusDialog;
