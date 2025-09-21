const Payment = require('../models/paymentModel');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');
const { Op, sequelize } = require('sequelize');

const paymentController = {
  // Create a new payment
  createPayment: async (req, res) => {
    try {
      const {
        userId,
        superUserId,
        amount,
        date,
        packageType,
        sessionCount,
        paymentMethod,
        transactionReference,
        gst,
        discount,
        notes
      } = req.body;

      // Validate required fields
      if (!userId || !amount || !packageType || !sessionCount) {
        return res.status(400).json({
          success: false,
          message: 'User ID, amount, package type, and session count are required'
        });
      }

      // IMPORTANT: Check that userId is not equal to superUserId
      if (superUserId && userId === superUserId) {
        return res.status(400).json({
          success: false,
          message: 'User cannot be their own super user (referrer)'
        });
      }

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify super user exists if provided
      if (superUserId) {
        const superUser = await User.findById(superUserId);
        if (!superUser) {
          return res.status(404).json({
            success: false,
            message: 'Super user not found'
          });
        }
      }

      // Calculate final amount
      const baseAmount = parseFloat(amount);
      const gstAmount = parseFloat(gst) || 0;
      const discountAmount = parseFloat(discount) || 0;
      const finalAmount = baseAmount + gstAmount - discountAmount;

      // Create payment
      const payment = await Payment.create({
        userId,
        superUserId,
        amount: baseAmount,
        date: date || new Date(),
        packageType,
        sessionCount,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: 'pending',
        transactionReference,
        gst: gstAmount,
        discount: discountAmount,
        finalAmount,
        notes
      });

      // Generate invoice number
      await payment.generateInvoiceNumber();
      await payment.save();

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment
      });

    } catch (error) {
      console.error('Create payment error:', error);

      // Handle validation error from model
      if (error.message === 'User ID cannot be the same as Super User ID') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get all payments
  getAllPayments: async (req, res) => {
    try {
      const {
        status,
        packageType,
        userId,
        superUserId,
        startDate,
        endDate
      } = req.query;

      let whereClause = {};

      // Apply filters
      if (status) {
        whereClause.paymentStatus = status;
      }

      if (packageType) {
        whereClause.packageType = packageType;
      }

      if (userId) {
        whereClause.userId = userId;
      }

      if (superUserId) {
        whereClause.superUserId = superUserId;
      }

      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const payments = await Payment.findAll({
        where: whereClause,
        order: [['date', 'DESC'], ['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: payments
      });

    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get payment by ID
  getPaymentById: async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get payment by paymentId
  getPaymentByPaymentId: async (req, res) => {
    try {
      const { paymentId } = req.params;

      const payment = await Payment.findByPaymentId(paymentId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get payments by user
  getUserPayments: async (req, res) => {
    try {
      const { userId } = req.params;

      const payments = await Payment.findByUserId(parseInt(userId));

      const totalSpent = await Payment.getUserTotalSpent(parseInt(userId));

      res.status(200).json({
        success: true,
        data: {
          payments,
          summary: {
            totalPayments: payments.length,
            totalSpent
          }
        }
      });

    } catch (error) {
      console.error('Get user payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get payments by super user
  getSuperUserPayments: async (req, res) => {
    try {
      const { superUserId } = req.params;

      const payments = await Payment.findBySuperUserId(parseInt(superUserId));

      const commissions = await Payment.getSuperUserCommissions(parseInt(superUserId));

      res.status(200).json({
        success: true,
        data: {
          payments,
          summary: commissions[0] || {
            totalReferrals: 0,
            totalAmount: 0,
            totalSessions: 0
          }
        }
      });

    } catch (error) {
      console.error('Get super user payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, transactionReference } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Payment status is required'
        });
      }

      const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }

      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Update payment status
      payment.paymentStatus = status;

      // Update transaction reference if provided
      if (transactionReference) {
        payment.transactionReference = transactionReference;
      }

      // If payment is marked as completed, generate invoice number if not exists
      if (status === 'completed' && !payment.invoiceNumber) {
        await payment.generateInvoiceNumber();
      }

      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        data: payment
      });

    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update payment
  updatePayment: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Don't allow status change if payment is completed or refunded
      if (payment.paymentStatus === 'completed' || payment.paymentStatus === 'refunded') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update completed or refunded payments'
        });
      }

      // Check userId != superUserId if being updated
      if (updateData.userId && updateData.superUserId) {
        if (updateData.userId === updateData.superUserId) {
          return res.status(400).json({
            success: false,
            message: 'User cannot be their own super user (referrer)'
          });
        }
      } else if (updateData.userId && payment.superUserId) {
        if (updateData.userId === payment.superUserId) {
          return res.status(400).json({
            success: false,
            message: 'User cannot be their own super user (referrer)'
          });
        }
      } else if (updateData.superUserId && payment.userId) {
        if (payment.userId === updateData.superUserId) {
          return res.status(400).json({
            success: false,
            message: 'User cannot be their own super user (referrer)'
          });
        }
      }

      // Recalculate final amount if any amount changes
      if (updateData.amount || updateData.gst || updateData.discount) {
        const baseAmount = parseFloat(updateData.amount || payment.amount);
        const gstAmount = parseFloat(updateData.gst !== undefined ? updateData.gst : payment.gst);
        const discountAmount = parseFloat(updateData.discount !== undefined ? updateData.discount : payment.discount);
        updateData.finalAmount = baseAmount + gstAmount - discountAmount;
      }

      await payment.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Payment updated successfully',
        data: payment
      });

    } catch (error) {
      console.error('Update payment error:', error);

      if (error.message === 'User ID cannot be the same as Super User ID') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Process refund
  processRefund: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (!payment.canBeRefunded()) {
        return res.status(400).json({
          success: false,
          message: 'Payment cannot be refunded. Only completed payments can be refunded.'
        });
      }

      await payment.markAsRefunded();

      // Add refund reason to notes
      if (reason) {
        payment.notes = payment.notes
          ? `${payment.notes}\nRefund Reason: ${reason}`
          : `Refund Reason: ${reason}`;
        await payment.save();
      }

      res.status(200).json({
        success: true,
        message: 'Payment refunded successfully',
        data: payment
      });

    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get payment statistics
  getPaymentStatistics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Get total revenue
      const totalRevenue = await Payment.getTotalRevenue(startDate, endDate);

      // Get payments by status
      const paymentsByStatus = await Payment.findAll({
        attributes: [
          'paymentStatus',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('finalAmount')), 'totalAmount']
        ],
        group: ['paymentStatus']
      });

      // Get payments by package type
      const paymentsByPackage = await Payment.findAll({
        where: { paymentStatus: 'completed' },
        attributes: [
          'packageType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('finalAmount')), 'totalAmount'],
          [sequelize.fn('SUM', sequelize.col('sessionCount')), 'totalSessions']
        ],
        group: ['packageType']
      });

      res.status(200).json({
        success: true,
        data: {
          totalRevenue,
          paymentsByStatus,
          paymentsByPackage
        }
      });

    } catch (error) {
      console.error('Get payment statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete payment
  deletePayment: async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Don't allow deletion of completed or refunded payments
      if (payment.paymentStatus === 'completed' || payment.paymentStatus === 'refunded') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete completed or refunded payments'
        });
      }

      await payment.destroy();

      res.status(200).json({
        success: true,
        message: 'Payment deleted successfully'
      });

    } catch (error) {
      console.error('Delete payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = paymentController;