// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    UserID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    FullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    PhoneNumber: {
      type: DataTypes.STRING(15),
    },
    Address: {
      type: DataTypes.TEXT,
    },
    ProfilePicture: {
      type: DataTypes.STRING(255),
    },
    Rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    Role: {
      type: DataTypes.ENUM('Renter', 'Owner', 'Both'),
      defaultValue: 'Both',
    },
    VerificationStatus: {
      type: DataTypes.ENUM('Verified', 'Unverified'),
      defaultValue: 'Unverified',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    DOB: { 
      type: DataTypes.DATE, 
      allowNull: true, 
    },
    gender: { 
      type: DataTypes.ENUM('Male', 'Female'), 
      allowNull: true, 
    },
  },
  {
    schema: 'advance',
    timestamps: false,
  }
);

module.exports = User;
///