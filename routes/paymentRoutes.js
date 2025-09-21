const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// All payment routes require authentication
router.use(authMiddleware.authenticate);

// Payment CRUD operations
router.post('/', authMiddleware.isTrainer, paymentController.createPayment);
router.get('/', authMiddleware.isTrainer, paymentController.getAllPayments);
router.get('/statistics', authMiddleware.isAdmin, paymentController.getPaymentStatistics);
router.get('/payment/:paymentId', paymentController.getPaymentByPaymentId);
router.get('/user/:userId', paymentController.getUserPayments);
router.get('/super-user/:superUserId', authMiddleware.isTrainer, paymentController.getSuperUserPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', authMiddleware.isTrainer, paymentController.updatePayment);
router.delete('/:id', authMiddleware.isAdmin, paymentController.deletePayment);

// Payment status management
router.patch('/:id/status', authMiddleware.isTrainer, paymentController.updatePaymentStatus);
router.post('/:id/refund', authMiddleware.isAdmin, paymentController.processRefund);

module.exports = router;