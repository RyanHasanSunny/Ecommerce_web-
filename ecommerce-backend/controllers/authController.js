const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Register user (admin or regular)
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Login user (admin or regular)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token with the role included in the payload
    const token = jwt.sign(
      { userId: user._id, role: user.role },  // Add role to JWT payload
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Send the token and role in the response
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
