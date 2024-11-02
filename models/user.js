const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    UserID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'UserID',
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
      defaultValue: 5.0,
    },
    numberOfRatings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    Role: {
      type: DataTypes.ENUM('Renter', 'Owner', 'Both', 'Admin'),
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
    Gender: {
      type: DataTypes.ENUM('Male', 'Female'),
      allowNull: true,
    },
    paymentIntent: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    deactivated_at: {  // New column for deactivation tracking
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    "AccountStatus": {
      type: DataTypes.ENUM('Active', 'Deactivated'), // Make sure this is included
      defaultValue: 'Active', // Default status is active
    },
    "DeactivationDate": {
      type: DataTypes.DATE, // Make sure this is included
      allowNull: true, // It's okay to be null initially
    },
  },
  {
    schema: 'advance',
    tableName: 'Users',
    timestamps: false,
  }
);

module.exports = User;
