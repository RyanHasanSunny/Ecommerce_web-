// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('Auth middleware hit:', req.method, req.path);
  console.log('Headers:', req.headers);
  
  const token = req.header('x-auth-token');
  console.log('Token received:', token ? 'Yes' : 'No');
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};