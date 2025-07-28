const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const statsRoutes = require('./routes/statsRoutes'); // Import your stats route
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');


app.use('/api/auth', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);  // Product routes
app.use('/api', statsRoutes);  // Stats routes
app.use('/api', orderRoutes); // Order routes
app.use('/api', cartRoutes); // Cart routes

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
