const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User   = require('../models/userModel');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (await User.findOne({ email })) {
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

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User does not exist' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET /api/auth/profile
// @desc    Get current user's profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   PUT /api/auth/profile/password
// @desc    Update current user's password
// @access  Private
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Please provide currentPassword and newPassword' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.addAddress = (req, res, next) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ msg: 'Address is required' });
  }

  User.findByIdAndUpdate(
    req.user.userId,
    { $push: { addresses: address } },
    { new: true }
  )
    .then(user => res.json(user))
    .catch(err => {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    });
}



exports.getUserAddresses = (req, res, next) => {
  User.findById(req.user.userId)
    .select('addresses')
    .then(user => {
      if (!user) return res.status(404).json({ msg: 'User not found' });
      res.json(user.addresses);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    });
};