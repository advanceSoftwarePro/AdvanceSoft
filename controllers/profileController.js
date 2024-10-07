
const User = require('../models/User');
const authService = require('../services/authService');
const { validateRegister } = require('../utils/validators');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const { Op } = require('sequelize');


// View profile
exports.getProfile = async (req, res) => {
  try {
      // Accessing the user ID from the middleware's decoded token
      const user = await User.findOne({ where: { UserID: req.user.id } });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Return the user's profile information
      return res.status(200).json({
          fullName: user.FullName,
          email: user.Email,
          phone: user.PhoneNumber,
          address: user.Address,
          profilePicture: user.ProfilePicture,
          rating: user.Rating,
          role: user.Role
      });
  } catch (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

///
exports.editProfile = async (req, res) => {
  try {
      if (!req.user) {
          return res.status(403).json({ message: 'User not authenticated' });
      }

      const userId = req.user.id;
      const { FullName, Email, PhoneNumber, gender, DOB, Address } = req.body;

      // Check if a file was uploaded
      let ProfilePicture = null;
      if (req.file) {
          ProfilePicture = req.file.path;
      }

      // Check if the email already exists for another user
      const emailExists = await User.findOne({
          where: { Email, UserID: { [Op.ne]: userId } } // Exclude the current user's record
      });

      if (emailExists) {
          return res.status(400).json({ message: 'Email is already in use by another user' });
      }

      // Update user profile
      await User.update(
          { FullName, Email, PhoneNumber, gender, DOB, Address, ProfilePicture },
          { where: { UserID: userId } }
      );

      res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
      console.error('Validation Error Details:', error);
      if (error.name === 'SequelizeValidationError') {
          const validationErrors = error.errors.map((err) => err.message);
          return res.status(400).json({ message: 'Validation error', errors: validationErrors });
      }
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
