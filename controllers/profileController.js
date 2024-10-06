
const User = require('../models/User');
const authService = require('../services/authService');
const { validateRegister } = require('../utils/validators');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

// View profile
exports.getProfile = async (req, res) => {
    try {
      const user = await User.findOne({ where: { UserID: req.userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
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
  

  exports.editProfile = async (req, res) => {
    try {
        if (!req.user) {
            console.log(req.user); // Change req.User to req.user
            return res.status(403).json({ message: 'User not authenticated' });
        }
        
        const userId = req.user.id; // Get user ID from the req.user object
        const { FullName, Email, PhoneNumber, gender,DOB, Address } = req.body;

        // Check if a file was uploaded
        let ProfilePicture = null;
        if (req.file) {
            ProfilePicture = req.file.path; // Get the file path
        }

        // Update user profile
        await User.update(
            { FullName, Email, PhoneNumber, gender, DOB, Address, ProfilePicture },
            { where: { UserID: userId } } // Adjust if your primary key is different
        );

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error); // More specific error logging
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
