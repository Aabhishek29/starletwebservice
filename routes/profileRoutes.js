const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// All profile routes require authentication and owner/admin access
router.get('/:userId', authMiddleware.authenticate, authMiddleware.isOwnerOrAdmin, profileController.getProfile);
router.put('/:userId/personal', authMiddleware.authenticate, authMiddleware.isOwnerOrAdmin, profileController.updatePersonalDetails);
router.put('/:userId/measurements', authMiddleware.authenticate, authMiddleware.isOwnerOrAdmin, profileController.updateMeasurements);
router.put('/:userId/bca', authMiddleware.authenticate, authMiddleware.isOwnerOrAdmin, profileController.updateBCA);
router.put('/:userId', authMiddleware.authenticate, authMiddleware.isOwnerOrAdmin, profileController.updateFullProfile);

module.exports = router;