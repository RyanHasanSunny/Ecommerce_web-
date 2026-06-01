const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User   = require('../models/userModel');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    // Create new user
    const newUser = new User({ name, email, password, role: role || 'user' });
    await newUser.save();
    
    res.status(201).json({ msg: 'User registered successfully. Please login.' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Registration failed. Please try again.' });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    const expiresIn = rememberMe ? '365d' : '1h';
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Set secure HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: rememberMe ? 365 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000
    };

    res.cookie('token', token, cookieOptions);
    res.json({ msg: 'Login successful', role: user.role });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Login failed. Please try again.' });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user by clearing cookie
// @access  Private
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ msg: 'Logout failed' });
  }
};

// @route   GET /api/auth/profile
// @desc    Get current user's profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch profile' });
  }
};

// @route   PUT /api/auth/password
// @desc    Update current user's password
// @access  Private
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err.message);
    res.status(500).json({ msg: 'Failed to update password' });
  }
};

// @route   GET /api/user/addresses
// @desc    Get user's addresses
// @access  Private
exports.getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('addresses');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const formattedAddresses = user.addresses.map((addr, index) => ({
      id: index,
      address: addr
    }));
    
    res.json(formattedAddresses);
  } catch (err) {
    console.error('Address fetch error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch addresses' });
  }
};

// @route   POST /api/user/address
// @desc    Add a new address
// @access  Private
exports.addAddress = async (req, res) => {
  const { address } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.addresses.push(address);
    await user.save();

    const newAddress = {
      id: user.addresses.length - 1,
      address: address
    };

    res.json(newAddress);
  } catch (err) {
    console.error('Address add error:', err.message);
    res.status(500).json({ msg: 'Failed to add address' });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.json({ msg: 'If email exists, password reset link will be sent' });
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('Password reset URL:', resetUrl);

    res.json({ msg: 'If email exists, password reset link will be sent' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ msg: 'Failed to process password reset' });
  }
};

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ msg: 'Failed to reset password' });
  }
};
