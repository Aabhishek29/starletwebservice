const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');

const sessionController = {
  // Create a new session
  createSession: async (req, res) => {
    try {
      const {
        personCount,
        startingTime,
        date,
        users,
        trainerId,
        endTime,
        notes
      } = req.body;

      // Validate required fields
      if (!personCount || !startingTime || !date) {
        return res.status(400).json({
          success: false,
          message: 'Person count, starting time, and date are required'
        });
      }

      // Validate person count
      if (personCount !== 1 && personCount !== 2) {
        return res.status(400).json({
          success: false,
          message: 'Person count must be 1 or 2'
        });
      }

      // Validate users array
      if (users && users.length > personCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than ${personCount} user(s) to this session`
        });
      }

      // Verify all users exist and convert to integers
      if (users && users.length > 0) {
        for (let i = 0; i < users.length; i++) {
          const userId = parseInt(users[i]);
          if (isNaN(userId)) {
            return res.status(400).json({
              success: false,
              message: `Invalid user ID: ${users[i]}`
            });
          }
          const user = await User.findById(userId);
          if (!user) {
            return res.status(400).json({
              success: false,
              message: `User not found with ID: ${userId}`
            });
          }
          // Replace with integer version
          users[i] = userId;
        }
      }

      // Verify trainer exists if trainerId provided
      if (trainerId) {
        const trainer = await User.findById(trainerId);
        if (!trainer || !trainer.isTrainer) {
          return res.status(400).json({
            success: false,
            message: 'Invalid trainer ID or user is not a trainer'
          });
        }
      }

      // Create session
      const session = await Session.create({
        personCount,
        startingTime,
        date,
        users: users || [],
        trainerId,
        endTime,
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Session created successfully',
        data: session
      });

    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get all sessions
  getAllSessions: async (req, res) => {
    try {
      const { date, status, trainerId, upcoming } = req.query;
      let whereClause = {};

      // Filter by date if provided
      if (date) {
        whereClause.date = date;
      }

      // Filter by status if provided
      if (status) {
        whereClause.status = status;
      }

      // Filter by trainer if provided
      if (trainerId) {
        whereClause.trainerId = trainerId;
      }

      // Get upcoming sessions
      if (upcoming === 'true') {
        const today = new Date().toISOString().split('T')[0];
        whereClause.date = {
          [Op.gte]: today
        };
        whereClause.status = {
          [Op.in]: ['scheduled', 'in_progress']
        };
      }

      const sessions = await Session.findAll({
        where: whereClause,
        order: [['date', 'DESC'], ['startingTime', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: sessions
      });

    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get session by ID
  getSessionById: async (req, res) => {
    try {
      const { id } = req.params;

      const session = await Session.findByPk(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      res.status(200).json({
        success: true,
        data: session
      });

    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get session by sessionId
  getSessionBySessionId: async (req, res) => {
    try {
      const { sessionId } = req.params;

      const session = await Session.findBySessionId(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      res.status(200).json({
        success: true,
        data: session
      });

    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get sessions by date
  getSessionsByDate: async (req, res) => {
    try {
      const { date } = req.params;

      const sessions = await Session.findByDate(date);

      res.status(200).json({
        success: true,
        data: sessions
      });

    } catch (error) {
      console.error('Get sessions by date error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get sessions by date range
  getSessionsByDateRange: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const sessions = await Session.findByDateRange(startDate, endDate);

      res.status(200).json({
        success: true,
        data: sessions
      });

    } catch (error) {
      console.error('Get sessions by date range error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get sessions for a specific user
  getUserSessions: async (req, res) => {
    try {
      const { userId } = req.params;

      const sessions = await Session.findByUser(parseInt(userId));

      res.status(200).json({
        success: true,
        data: sessions
      });

    } catch (error) {
      console.error('Get user sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get upcoming sessions
  getUpcomingSessions: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const sessions = await Session.findUpcoming(limit);

      res.status(200).json({
        success: true,
        data: sessions
      });

    } catch (error) {
      console.error('Get upcoming sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update session
  updateSession: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const session = await Session.findByPk(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Validate person count if being updated
      if (updateData.personCount) {
        if (updateData.personCount !== 1 && updateData.personCount !== 2) {
          return res.status(400).json({
            success: false,
            message: 'Person count must be 1 or 2'
          });
        }

        // Check if current users exceed new person count
        if (session.users.length > updateData.personCount) {
          return res.status(400).json({
            success: false,
            message: `Cannot reduce person count. Session already has ${session.users.length} user(s)`
          });
        }
      }

      // Validate users array if being updated
      if (updateData.users) {
        const maxUsers = updateData.personCount || session.personCount;
        if (updateData.users.length > maxUsers) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more than ${maxUsers} user(s) to this session`
          });
        }
      }

      // Verify trainer if trainerId is being updated
      if (updateData.trainerId) {
        const trainer = await User.findById(updateData.trainerId);
        if (!trainer || !trainer.isTrainer) {
          return res.status(400).json({
            success: false,
            message: 'Invalid trainer ID or user is not a trainer'
          });
        }
      }

      await session.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Session updated successfully',
        data: session
      });

    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Add user to session
  addUserToSession: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const session = await Session.findByPk(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add user to session
      await session.addUser(userId);

      res.status(200).json({
        success: true,
        message: 'User added to session successfully',
        data: session
      });

    } catch (error) {
      console.error('Add user to session error:', error);

      if (error.message.includes('Session is full')) {
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

  // Remove user from session
  removeUserFromSession: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const session = await Session.findByPk(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      await session.removeUser(userId);

      res.status(200).json({
        success: true,
        message: 'User removed from session successfully',
        data: session
      });

    } catch (error) {
      console.error('Remove user from session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update session status
  updateSessionStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: scheduled, in_progress, completed, cancelled'
        });
      }

      const session = await Session.findByPk(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      await session.update({ status });

      res.status(200).json({
        success: true,
        message: 'Session status updated successfully',
        data: session
      });

    } catch (error) {
      console.error('Update session status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete session
  deleteSession: async (req, res) => {
    try {
      const { id } = req.params;

      const session = await Session.findByPk(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      await session.destroy();

      res.status(200).json({
        success: true,
        message: 'Session deleted successfully'
      });

    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = sessionController;