const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route to get upcoming sessions (for display purposes)
router.get('/upcoming', sessionController.getUpcomingSessions);

// Protected routes - Require authentication
router.use(authMiddleware.authenticate);

// Session CRUD operations
router.post('/', authMiddleware.isTrainer, sessionController.createSession);
router.get('/', sessionController.getAllSessions);
router.get('/date-range', sessionController.getSessionsByDateRange);
router.get('/date/:date', sessionController.getSessionsByDate);
router.get('/user/:userId', sessionController.getUserSessions);
router.get('/session/:sessionId', sessionController.getSessionBySessionId);
router.get('/:id', sessionController.getSessionById);
router.put('/:id', authMiddleware.isTrainer, sessionController.updateSession);
router.delete('/:id', authMiddleware.isAdmin, sessionController.deleteSession);

// Session user management
router.post('/:id/add-user', sessionController.addUserToSession);
router.post('/:id/remove-user', authMiddleware.isTrainer, sessionController.removeUserFromSession);

// Session status management
router.patch('/:id/status', authMiddleware.isTrainer, sessionController.updateSessionStatus);

module.exports = router;