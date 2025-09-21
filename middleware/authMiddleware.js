const jwtUtils = require('../utils/jwtUtils');
const User = require('../models/userModel');

const authMiddleware = {
  authenticate: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'No authorization header provided'
        });
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const decoded = jwtUtils.verifyToken(token);

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user.toJSON();
      next();

    } catch (error) {
      console.error('Authentication error:', error);

      if (error.message === 'Token has expired') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      } else if (error.message === 'Invalid token') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  },

  isAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  },

  isTrainer: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.isTrainer && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Trainer or Admin access required'
      });
    }

    next();
  },

  isOwnerOrAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = parseInt(req.params.userId) || parseInt(req.params.id);

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own data'
      });
    }

    next();
  }
};

module.exports = authMiddleware;