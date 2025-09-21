const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paymentId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => {
      // Generate unique payment ID
      return 'PAY_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID of the user making the payment'
  },
  superUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID of the super user (referrer/sponsor)'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    },
    comment: 'Payment amount'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Payment date'
  },
  packageType: {
    type: DataTypes.ENUM('basic', 'standard', 'premium', 'custom'),
    allowNull: false,
    comment: 'Type of package purchased'
  },
  sessionCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Number of sessions included in the package'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'upi', 'netbanking', 'wallet', 'other'),
    defaultValue: 'cash',
    comment: 'Payment method used'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'Current status of the payment'
  },
  transactionReference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External transaction reference (from payment gateway)'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
    comment: 'Currency code'
  },
  gst: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'GST amount'
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Discount amount'
  },
  finalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Final amount after GST and discount'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional payment notes'
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    comment: 'Invoice number for this payment'
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
  tableName: 'payments',
  timestamps: true,
  indexes: [
    {
      fields: ['paymentId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['superUserId']
    },
    {
      fields: ['date']
    },
    {
      fields: ['paymentStatus']
    },
    {
      fields: ['packageType']
    }
  ],
  validate: {
    userNotEqualSuperUser() {
      if (this.userId && this.superUserId && this.userId === this.superUserId) {
        throw new Error('User ID cannot be the same as Super User ID');
      }
    }
  }
});

// Class methods
Payment.findByPaymentId = async function(paymentId) {
  return await this.findOne({ where: { paymentId } });
};

Payment.findByUserId = async function(userId) {
  return await this.findAll({
    where: { userId },
    order: [['date', 'DESC']]
  });
};

Payment.findBySuperUserId = async function(superUserId) {
  return await this.findAll({
    where: { superUserId },
    order: [['date', 'DESC']]
  });
};

Payment.findByDateRange = async function(startDate, endDate) {
  const { Op } = require('sequelize');
  return await this.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'DESC']]
  });
};

Payment.findByStatus = async function(paymentStatus) {
  return await this.findAll({
    where: { paymentStatus },
    order: [['date', 'DESC']]
  });
};

Payment.findByPackageType = async function(packageType) {
  return await this.findAll({
    where: { packageType },
    order: [['date', 'DESC']]
  });
};

Payment.getTotalRevenue = async function(startDate = null, endDate = null) {
  const { Op } = require('sequelize');
  let whereClause = {
    paymentStatus: 'completed'
  };

  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  }

  const result = await this.sum('finalAmount', {
    where: whereClause
  });

  return result || 0;
};

Payment.getUserTotalSpent = async function(userId) {
  const result = await this.sum('finalAmount', {
    where: {
      userId,
      paymentStatus: 'completed'
    }
  });

  return result || 0;
};

Payment.getSuperUserCommissions = async function(superUserId) {
  return await this.findAll({
    where: {
      superUserId,
      paymentStatus: 'completed'
    },
    attributes: [
      'superUserId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalReferrals'],
      [sequelize.fn('SUM', sequelize.col('finalAmount')), 'totalAmount'],
      [sequelize.fn('SUM', sequelize.col('sessionCount')), 'totalSessions']
    ],
    group: ['superUserId']
  });
};

// Instance methods
Payment.prototype.calculateFinalAmount = function() {
  const baseAmount = parseFloat(this.amount);
  const gst = parseFloat(this.gst) || 0;
  const discount = parseFloat(this.discount) || 0;

  this.finalAmount = baseAmount + gst - discount;
  return this.finalAmount;
};

Payment.prototype.generateInvoiceNumber = function() {
  const date = new Date(this.date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  this.invoiceNumber = `INV${year}${month}${String(this.id).padStart(6, '0')}`;
  return this.invoiceNumber;
};

Payment.prototype.canBeRefunded = function() {
  return this.paymentStatus === 'completed';
};

Payment.prototype.markAsCompleted = async function() {
  this.paymentStatus = 'completed';
  await this.save();
  return this;
};

Payment.prototype.markAsFailed = async function() {
  this.paymentStatus = 'failed';
  await this.save();
  return this;
};

Payment.prototype.markAsRefunded = async function() {
  if (!this.canBeRefunded()) {
    throw new Error('Payment cannot be refunded');
  }
  this.paymentStatus = 'refunded';
  await this.save();
  return this;
};

module.exports = Payment;