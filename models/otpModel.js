const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'otps',
  timestamps: true
});

OTP.generateOTP = function() {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

OTP.createOTP = async function(phoneNumber) {
  const otp = this.generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await this.destroy({
    where: {
      phoneNumber,
      isVerified: false
    }
  });

  const otpRecord = await this.create({
    phoneNumber,
    otp,
    expiresAt
  });

  return otpRecord;
};

OTP.verifyOTP = async function(phoneNumber, otp) {
  const otpRecord = await this.findOne({
    where: {
      phoneNumber,
      otp,
      isVerified: false
    }
  });

  if (!otpRecord) {
    return { success: false, message: 'Invalid OTP' };
  }

  if (otpRecord.attempts >= 3) {
    return { success: false, message: 'Maximum attempts exceeded' };
  }

  if (new Date() > otpRecord.expiresAt) {
    return { success: false, message: 'OTP expired' };
  }

  await otpRecord.update({ isVerified: true });
  return { success: true, message: 'OTP verified successfully' };
};

module.exports = OTP;