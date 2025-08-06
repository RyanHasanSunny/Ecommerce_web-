
// middleware/adminMiddleware.js
module.exports = (req, res, next) => {
  // This middleware should be used AFTER authMiddleware
  // authMiddleware sets req.user with userId and role
  
  if (!req.user) {
    return res.status(401).json({ msg: 'No authentication token provided' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      msg: 'Access denied. Admin privileges required.',
      yourRole: req.user.role 
    });
  }

  next();
};