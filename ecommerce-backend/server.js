const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const color = require('colors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { createServer } = require('http');

dotenv.config();

// Check for required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

connectDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection:', err.message);
  httpServer.close(() => {
    console.error('Server closed due to unhandled rejection');
    process.exit(1);
  });
});

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow any localhost origin
    if (process.env.NODE_ENV !== 'production' && origin && origin.startsWith('http://localhost')) {
      console.log('CORS: Allowing localhost origin in development:', origin);
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:3000', // Frontend development
      'http://localhost:5173', // Vite default
      'http://localhost:4000', // Additional common dev port
      'http://localhost:8080', // Additional common dev port
      process.env.FRONTEND_URL // Production frontend URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowing configured origin:', origin);
      return callback(null, true);
    }

    console.log('CORS: Blocking origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  exposedHeaders: ['Set-Cookie'] // Expose Set-Cookie header to frontend
};

app.use(cors(corsOptions));

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
app.use('/api',           require('./routes/HomeRoutes'));

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