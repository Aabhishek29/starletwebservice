const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const whatsappService = require('../services/whatsappService');
const jwtUtils = require('../utils/jwtUtils');

const otpController = {
  sendOTP: async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }

      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanedNumber = phoneNumber.replace(/\D/g, '');

      if (!phoneRegex.test(cleanedNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Indian phone number'
        });
      }

      const otpRecord = await OTP.createOTP(cleanedNumber);

      const result = await whatsappService.sendOTP(cleanedNumber, otpRecord.otp);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP via WhatsApp'
        });
      }

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully via WhatsApp',
        expiresIn: '10 minutes'
      });

    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  verifyOTPAndLogin: async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;

      if (!phoneNumber || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and OTP are required'
        });
      }

      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      const verificationResult = await OTP.verifyOTP(cleanedNumber, otp);

      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          message: verificationResult.message
        });
      }

      let user = await User.findOne({
        where: { phoneNumber: cleanedNumber }
      });

      if (!user) {
        const name = 'User_' + cleanedNumber.slice(-4) + '_' + Date.now().toString().slice(-4);

        user = await User.create({
          phoneNumber: cleanedNumber,
          name
        });

        await whatsappService.sendWelcomeMessage(cleanedNumber, name);
      } else {
        await whatsappService.sendLoginNotification(cleanedNumber);
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
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  resendOTP: async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }

      const cleanedNumber = phoneNumber.replace(/\D/g, '');

      const existingOTP = await OTP.findOne({
        where: {
          phoneNumber: cleanedNumber,
          isVerified: false
        },
        order: [['createdAt', 'DESC']]
      });

      if (existingOTP) {
        const timeDiff = Date.now() - new Date(existingOTP.createdAt).getTime();
        const minutesPassed = Math.floor(timeDiff / (1000 * 60));

        if (minutesPassed < 2) {
          return res.status(429).json({
            success: false,
            message: `Please wait ${2 - minutesPassed} minute(s) before requesting a new OTP`
          });
        }
      }

      const otpRecord = await OTP.createOTP(cleanedNumber);

      const result = await whatsappService.sendOTP(cleanedNumber, otpRecord.otp);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP via WhatsApp'
        });
      }

      res.status(200).json({
        success: true,
        message: 'OTP resent successfully via WhatsApp',
        expiresIn: '10 minutes'
      });

    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = otpController;