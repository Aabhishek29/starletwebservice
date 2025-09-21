const twilio = require('twilio');
require('dotenv').config();

class WhatsAppService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  }

  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');

    if (!cleaned.startsWith('91')) {
      cleaned = '91' + cleaned;
    }

    return 'whatsapp:+' + cleaned;
  }

  async sendOTP(phoneNumber, otp) {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      const message = await this.client.messages.create({
        body: `Your verification OTP is: *${otp}*\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.`,
        from: this.twilioPhoneNumber,
        to: formattedNumber
      });

      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendWelcomeMessage(phoneNumber, username) {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      const message = await this.client.messages.create({
        body: `Welcome to Web Services, ${username}! 🎉\n\nYour account has been successfully created.\n\nYou can now login using WhatsApp OTP.`,
        from: this.twilioPhoneNumber,
        to: formattedNumber
      });

      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendLoginNotification(phoneNumber) {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      const message = await this.client.messages.create({
        body: `Login successful! ✅\n\nYou have logged into Web Services at ${timestamp}.\n\nIf this wasn't you, please contact support immediately.`,
        from: this.twilioPhoneNumber,
        to: formattedNumber
      });

      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new WhatsAppService();