const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

const jwtUtils = {
  generateAccessToken: (userId, email, phoneNumber, isAdmin, isTrainer) => {
    const payload = {
      id: userId,
      email,
      phoneNumber,
      isAdmin,
      isTrainer
    };

    return jwt.sign(payload, JWT_SECRET);
  },

  generateRefreshToken: (userId) => {
    const payload = {
      id: userId,
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN
    });
  },

  generateTokens: (user) => {
    const accessToken = jwtUtils.generateAccessToken(
      user.id,
      user.email,
      user.phoneNumber,
      user.isAdmin,
      user.isTrainer
    );

    return {
      accessToken
    };
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  },

  decodeToken: (token) => {
    return jwt.decode(token);
  }
};

module.exports = jwtUtils;