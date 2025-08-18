import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

const OrderStats = ({ stats }) => (
  <Grid container spacing={2} sx={{ mb: 3 }}>
    <Grid item xs={12} sm={6} md={2.4}>
      <Card><CardContent>
        <Typography color="text.secondary">Total Orders</Typography>
        <Typography variant="h5">{stats.totalOrders || 0}</Typography>
      </CardContent></Card>
    </Grid>
    <Grid item xs={12} sm={6} md={2.4}>
      <Card><CardContent>
        <Typography color="text.secondary">Today's Orders</Typography>
        <Typography variant="h5">{stats.todayOrders || 0}</Typography>
      </CardContent></Card>
    </Grid>
    {/* Repeat for Revenue, Profit, Pending Orders */}
  </Grid>
);

export default OrderStats;
