const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  isTrainer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },

  // Personal Details
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Height in cm'
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Weight in kg'
  },

  // Body Measurements (in cm)
  measurements_chest: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Chest measurement in cm'
  },
  measurements_upperWaist: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Upper waist measurement in cm'
  },
  measurements_midWaist: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Mid waist measurement in cm'
  },
  measurements_lowerWaist: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Lower waist measurement in cm'
  },
  measurements_rightThigh: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Right thigh measurement in cm'
  },
  measurements_leftThigh: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Left thigh measurement in cm'
  },
  measurements_rightArm: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Right arm measurement in cm'
  },
  measurements_leftArm: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Left arm measurement in cm'
  },

  // Body Composition Analysis (BCA)
  bca_weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'BCA weight in kg'
  },
  bca_bmi: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Body Mass Index'
  },
  bca_bodyFat: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Body fat percentage'
  },
  bca_muscleRate: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Muscle rate percentage'
  },
  bca_subcutaneousFat: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Subcutaneous fat percentage'
  },
  bca_visceralFat: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Visceral fat level'
  },
  bca_bodyAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Metabolic body age'
  },
  bca_bmr: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Basal Metabolic Rate in kcal'
  },
  bca_skeletalMass: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Skeletal mass in kg'
  },
  bca_muscleMass: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Muscle mass in kg'
  },
  bca_boneMass: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Bone mass in kg'
  },
  bca_protein: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Protein percentage'
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
  tableName: 'users',
  timestamps: true
});

User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

User.findByPhone = async function(phoneNumber) {
  return await this.findOne({ where: { phoneNumber } });
};

User.findById = async function(id) {
  return await this.findByPk(id);
};

module.exports = User;