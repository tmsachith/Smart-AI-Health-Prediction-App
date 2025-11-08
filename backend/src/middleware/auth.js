const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};

/**
 * Check if user is elder role
 */
const elderOnly = (req, res, next) => {
  if (req.user && req.user.role === 'elder') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Elder role required.',
    });
  }
};

/**
 * Check if user is family role
 */
const familyOnly = (req, res, next) => {
  if (req.user && req.user.role === 'family') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Family role required.',
    });
  }
};

module.exports = { protect, elderOnly, familyOnly };
