
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// Custom error class for authentication errors
class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}

// Middleware to protect routes that require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (if using cookies)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      throw new AuthError('Not authorized to access this route', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        throw new AuthError('User not found', 401);
      }

      // Check if user is banned
      if (user.isBanned) {
        throw new AuthError('Your account has been banned', 403);
      }

      // Update last active timestamp
      await user.updateLastActive();

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AuthError('Invalid token', 401);
      } else if (error.name === 'TokenExpiredError') {
        throw new AuthError('Token expired', 401);
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

// Middleware for optional authentication (doesn't throw error if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (if using cookies)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (user && !user.isBanned) {
          // Update last active timestamp
          await user.updateLastActive();
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't throw error for optional auth
        console.log('Optional auth failed:', error.message);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// Verify JWT token (utility function)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new AuthError('Invalid token', 401);
  }
};

// Get user from token (utility function)
const getUserFromToken = async (token) => {
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id).select('-password');
  
  if (!user) {
    throw new AuthError('User not found', 401);
  }
  
  if (user.isBanned) {
    throw new AuthError('User is banned', 403);
  }
  
  return user;
};

module.exports = {
  protect,
  optionalAuth,
  generateToken,
  verifyToken,
  getUserFromToken,
  AuthError
};
