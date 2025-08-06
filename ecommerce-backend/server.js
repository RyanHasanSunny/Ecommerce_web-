const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const color = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { createServer } = require('http');

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Health-check
app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

// Mount your routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/user',      require('./routes/userRoutes'));  // NEW ROUTE
app.use('/api',           require('./routes/categoryRoutes'));
app.use('/api',           require('./routes/productRoutes'));
app.use('/api',           require('./routes/statsRoutes'));
app.use('/api',           require('./routes/orderRoutes'));
app.use('/api',           require('./routes/cartRoutes'));
app.use('/api/upload',    require('./routes/uploadRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    msg: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

const PORT = process.env.PORT || 8080;

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.cyan.bold);
});