const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const jwtUtils = require('../utils/jwtUtils');

const userController = {
  requestOTPLogin: async (req, res) => {
    try {
      const { email, phoneNumber } = req.body;

      if (!email && !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Email or phone number is required'
        });
      }

      let identifier, identifierType;

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
        }
        identifier = email;
        identifierType = 'email';
      } else {
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanedNumber = phoneNumber.replace(/\D/g, '');

        if (!phoneRegex.test(cleanedNumber)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Indian phone number'
          });
        }
        identifier = cleanedNumber;
        identifierType = 'phone';
      }

      const otpRecord = await OTP.createOTP(identifier);

      res.status(200).json({
        success: true,
        message: `OTP sent to your ${identifierType === 'email' ? 'email' : 'WhatsApp'}`,
        identifierType,
        expiresIn: '10 minutes'
      });

    } catch (error) {
      console.error('Request OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  verifyOTPLogin: async (req, res) => {
    try {
      const { email, phoneNumber, otp } = req.body;

      if ((!email && !phoneNumber) || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Identifier (email or phone) and OTP are required'
        });
      }

      const identifier = email || phoneNumber.replace(/\D/g, '');
      const verificationResult = await OTP.verifyOTP(identifier, otp);

      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          message: verificationResult.message
        });
      }

      let user;
      if (email) {
        user = await User.findByEmail(email);
        if (!user) {
          user = await User.create({
            email,
            name: email.split('@')[0]
          });
        }
      } else {
        const cleanedNumber = phoneNumber.replace(/\D/g, '');
        user = await User.findByPhone(cleanedNumber);
        if (!user) {
          user = await User.create({
            phoneNumber: cleanedNumber,
            name: `User_${cleanedNumber.slice(-4)}`
          });
        }
      }

      const userData = user.toJSON();
      const tokens = jwtUtils.generateTokens(userData);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userData,
        tokens
      });

    } catch (error) {
      console.error('Verify OTP login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: [] }
      });

      res.status(200).json({
        success: true,
        data: users
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = userController;