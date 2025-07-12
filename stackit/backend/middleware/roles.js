const { AuthError } = require('./auth');

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthError('Authentication required', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AuthError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthError('Authentication required', 401);
      }

      // Convert single role to array
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthError(`Access denied. Required roles: ${allowedRoles.join(', ')}`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user is the owner of a resource
const requireOwnership = (resourceField = 'author') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthError('Authentication required', 401);
      }

      const resource = req.resource || req.question || req.answer;

      if (!resource) {
        throw new AuthError('Resource not found', 404);
      }

      // Check if user is the owner or an admin
      if (resource[resourceField].toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AuthError('You can only modify your own content', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user can perform actions (not banned)
const requireActiveUser = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthError('Authentication required', 401);
    }

    if (!req.user.canPerformAction()) {
      throw new AuthError('Your account has been suspended', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user has minimum reputation
const requireReputation = (minReputation) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthError('Authentication required', 401);
      }

      if (req.user.reputation < minReputation) {
        throw new AuthError(`Minimum reputation of ${minReputation} required`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user can vote
const canVote = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthError('Authentication required', 401);
    }

    // Users need at least 15 reputation to vote
    if (req.user.reputation < 15) {
      throw new AuthError('Minimum reputation of 15 required to vote', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user can comment
const canComment = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthError('Authentication required', 401);
    }

    // Users need at least 50 reputation to comment
    if (req.user.reputation < 50) {
      throw new AuthError('Minimum reputation of 50 required to comment', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user can create tags
const canCreateTags = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthError('Authentication required', 401);
    }

    // Users need at least 100 reputation to create tags
    if (req.user.reputation < 100) {
      throw new AuthError('Minimum reputation of 100 required to create tags', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user can close questions
const canCloseQuestions = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthError('Authentication required', 401);
    }

    // Only admins or users with 3000+ reputation can close questions
    if (req.user.role !== 'admin' && req.user.reputation < 3000) {
      throw new AuthError('Minimum reputation of 3000 or admin role required to close questions', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user can moderate content
const canModerate = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthError('Authentication required', 401);
    }

    // Only admins or users with 2000+ reputation can moderate
    if (req.user.role !== 'admin' && req.user.reputation < 2000) {
      throw new AuthError('Minimum reputation of 2000 or admin role required to moderate content', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user can access admin features
const canAccessAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthError('Authentication required', 401);
    }

    // Only admins can access admin features
    if (req.user.role !== 'admin') {
      throw new AuthError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireAdmin,
  requireRole,
  requireOwnership,
  requireActiveUser,
  requireReputation,
  canVote,
  canComment,
  canCreateTags,
  canCloseQuestions,
  canModerate,
  canAccessAdmin
}; 