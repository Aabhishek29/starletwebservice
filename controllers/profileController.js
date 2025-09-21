const User = require('../models/userModel');

const profileController = {
  getProfile: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  updatePersonalDetails: async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, mobileNumber, height, weight } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({
        name,
        mobileNumber,
        height,
        weight
      });

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      res.status(200).json({
        success: true,
        message: 'Personal details updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Update personal details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  updateMeasurements: async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        chest,
        upperWaist,
        midWaist,
        lowerWaist,
        rightThigh,
        leftThigh,
        rightArm,
        leftArm
      } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({
        measurements_chest: chest,
        measurements_upperWaist: upperWaist,
        measurements_midWaist: midWaist,
        measurements_lowerWaist: lowerWaist,
        measurements_rightThigh: rightThigh,
        measurements_leftThigh: leftThigh,
        measurements_rightArm: rightArm,
        measurements_leftArm: leftArm
      });

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      res.status(200).json({
        success: true,
        message: 'Body measurements updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Update measurements error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  updateBCA: async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        weight,
        bmi,
        bodyFat,
        muscleRate,
        subcutaneousFat,
        visceralFat,
        bodyAge,
        bmr,
        skeletalMass,
        muscleMass,
        boneMass,
        protein
      } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({
        bca_weight: weight,
        bca_bmi: bmi,
        bca_bodyFat: bodyFat,
        bca_muscleRate: muscleRate,
        bca_subcutaneousFat: subcutaneousFat,
        bca_visceralFat: visceralFat,
        bca_bodyAge: bodyAge,
        bca_bmr: bmr,
        bca_skeletalMass: skeletalMass,
        bca_muscleMass: muscleMass,
        bca_boneMass: boneMass,
        bca_protein: protein
      });

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      res.status(200).json({
        success: true,
        message: 'Body composition analysis updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Update BCA error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  updateFullProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        personalDetails,
        measurements,
        bca
      } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updateData = {};

      if (personalDetails) {
        updateData.name = personalDetails.name;
        updateData.mobileNumber = personalDetails.mobileNumber;
        updateData.height = personalDetails.height;
        updateData.weight = personalDetails.weight;
      }

      if (measurements) {
        updateData.measurements_chest = measurements.chest;
        updateData.measurements_upperWaist = measurements.upperWaist;
        updateData.measurements_midWaist = measurements.midWaist;
        updateData.measurements_lowerWaist = measurements.lowerWaist;
        updateData.measurements_rightThigh = measurements.rightThigh;
        updateData.measurements_leftThigh = measurements.leftThigh;
        updateData.measurements_rightArm = measurements.rightArm;
        updateData.measurements_leftArm = measurements.leftArm;
      }

      if (bca) {
        updateData.bca_weight = bca.weight;
        updateData.bca_bmi = bca.bmi;
        updateData.bca_bodyFat = bca.bodyFat;
        updateData.bca_muscleRate = bca.muscleRate;
        updateData.bca_subcutaneousFat = bca.subcutaneousFat;
        updateData.bca_visceralFat = bca.visceralFat;
        updateData.bca_bodyAge = bca.bodyAge;
        updateData.bca_bmr = bca.bmr;
        updateData.bca_skeletalMass = bca.skeletalMass;
        updateData.bca_muscleMass = bca.muscleMass;
        updateData.bca_boneMass = bca.boneMass;
        updateData.bca_protein = bca.protein;
      }

      await user.update(updateData);

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Update full profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = profileController;