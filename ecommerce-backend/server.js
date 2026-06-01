const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const color = require('colors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
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

// Security: Add Helmet for HTTP security headers
app.use(helmet());

// Security: Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Security: Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from public/uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Middleware
app.use(cookieParser());
app.use(morgan('combined')); // Use 'combined' instead of 'dev' for production-ready logging

// Rate limiting: General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: { msg: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting: Strict auth rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: { msg: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiter to all API requests
app.use('/api/', apiLimiter);

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
app.use('/api/user',      require('./routes/userRoutes'));
app.use('/api',           require('./routes/categoryRoutes'));
app.use('/api',           require('./routes/productRoutes'));
app.use('/api',           require('./routes/statsRoutes'));
app.use('/api',           require('./routes/orderRoutes'));
app.use('/api',           require('./routes/cartRoutes'));
app.use('/api/upload',    require('./routes/uploadRoutes'));
app.use('/api',           require('./routes/HomeRoutes'));
app.use('/api/promos',    require('./routes/promoRoutes'));

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error internally (don't expose details to client)
  console.error(`[${new Date().toISOString()}] Error (${status}):`, message);
  
  // Send generic error response in production, detailed in development
  const response = {
    msg: status === 404 ? 'Resource not found' : 'Something went wrong'
  };
  
  if (process.env.NODE_ENV === 'development') {
    response.error = message;
  }
  
  res.status(status).json(response);
});

// Handle 404 - must be after all other routes
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

const PORT = process.env.PORT || 8080;

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.cyan.bold);
});

module.exports = { app, authLimiter };