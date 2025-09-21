const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => {
      // Generate unique session ID
      return 'SESSION_' + crypto.randomBytes(8).toString('hex').toUpperCase();
    }
  },
  personCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 2,
      isIn: [[1, 2]]
    },
    comment: 'Number of persons in session (1 or 2)'
  },
  startingTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Session starting time'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Session date'
  },
  users: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false,
    comment: 'Array of user IDs participating in the session',
    get() {
      const value = this.getDataValue('users');
      return value || [];
    },
    set(value) {
      this.setDataValue('users', Array.isArray(value) ? value : []);
    }
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Session end time'
  },
  trainerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Assigned trainer ID'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Session notes or comments'
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
  tableName: 'sessions',
  timestamps: true,
  indexes: [
    {
      fields: ['sessionId']
    },
    {
      fields: ['date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['trainerId']
    }
  ]
});

// Class methods
Session.findBySessionId = async function(sessionId) {
  return await this.findOne({ where: { sessionId } });
};

Session.findByDate = async function(date) {
  return await this.findAll({
    where: { date },
    order: [['startingTime', 'ASC']]
  });
};

Session.findByDateRange = async function(startDate, endDate) {
  const { Op } = require('sequelize');
  return await this.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'ASC'], ['startingTime', 'ASC']]
  });
};

Session.findByUser = async function(userId) {
  const { Op } = require('sequelize');
  return await this.findAll({
    where: sequelize.where(
      sequelize.fn('JSON_CONTAINS', sequelize.col('users'), JSON.stringify(userId)),
      true
    ),
    order: [['date', 'DESC'], ['startingTime', 'DESC']]
  });
};

Session.findUpcoming = async function(limit = 10) {
  const { Op } = require('sequelize');
  const today = new Date().toISOString().split('T')[0];

  return await this.findAll({
    where: {
      date: {
        [Op.gte]: today
      },
      status: {
        [Op.in]: ['scheduled', 'in_progress']
      }
    },
    order: [['date', 'ASC'], ['startingTime', 'ASC']],
    limit
  });
};

Session.findByTrainer = async function(trainerId) {
  return await this.findAll({
    where: { trainerId },
    order: [['date', 'DESC'], ['startingTime', 'DESC']]
  });
};

// Instance methods
Session.prototype.addUser = async function(userId) {
  const users = this.users || [];

  if (users.length >= this.personCount) {
    throw new Error(`Session is full. Maximum ${this.personCount} person(s) allowed.`);
  }

  if (!users.includes(userId)) {
    users.push(userId);
    this.users = users;
    await this.save();
  }

  return this;
};

Session.prototype.removeUser = async function(userId) {
  const users = this.users || [];
  const index = users.indexOf(userId);

  if (index > -1) {
    users.splice(index, 1);
    this.users = users;
    await this.save();
  }

  return this;
};

Session.prototype.isFull = function() {
  return (this.users || []).length >= this.personCount;
};

Session.prototype.hasUser = function(userId) {
  return (this.users || []).includes(userId);
};

module.exports = Session;