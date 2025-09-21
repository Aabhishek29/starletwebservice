const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/request-otp', userController.requestOTPLogin);
router.post('/verify-otp', userController.verifyOTPLogin);

// Protected routes
router.get('/', authMiddleware.authenticate, authMiddleware.isAdmin, userController.getAllUsers);
router.get('/:id', authMiddleware.authenticate, authMiddleware.isOwnerOrAdmin, userController.getUserById);

module.exports = router;