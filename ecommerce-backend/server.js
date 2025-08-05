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



// // Configure Socket.io
// const io = new Server(httpServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// // After creating the io instance
// app.set('io', io); // Add this line

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());


// console.log('🔧 server.js loaded');

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB error:', err));

// // Middleware
// app.use(cors());
// app.use(express.json());

// ─── THIS LINE SHOWS EVERY REQUEST ─────────────────────────────────────────────
app.use(morgan('dev'));

// Health-check
app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

// Mount your routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api', require('./routes/categoryRoutes'));
app.use('/api',   require('./routes/productRoutes'));
app.use('/api',      require('./routes/statsRoutes'));
app.use('/api',     require('./routes/orderRoutes'));
app.use('/api',       require('./routes/cartRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));


const PORT = process.env.PORT || 5000 ;
// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
