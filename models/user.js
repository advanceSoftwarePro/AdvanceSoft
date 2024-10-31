const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
//const Rental = require('./Rentals');  // Import the Rental model


const User = sequelize.define(
  'User',
  {
    "UserID": {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'UserID' // Explicitly define the column name

    },
    "FullName": {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    "Email": {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    "Password": {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    "PhoneNumber": {
      type: DataTypes.STRING(15),
    },
    "Address": {
      type: DataTypes.TEXT,
    },
    "ProfilePicture": {
      type: DataTypes.STRING(255),
    },
    "Rating": {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.0,
    },
    "numberOfRatings" : {
      type: DataTypes.INTEGER,
      defaultValue: 0 // Initially set to 0
  },
    "Role": {
      type: DataTypes.ENUM('Renter', 'Owner', 'Both'),
      defaultValue: 'Both',
    },
    "VerificationStatus": {
      type: DataTypes.ENUM('Verified', 'Unverified'),
      defaultValue: 'Unverified',
    },
    "CreatedAt": {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    "DOB": {  // New column for Date of Birth
      type: DataTypes.DATE,
      allowNull: true,
    },
    "Gender": {  // New column for Gender using the enum type
      type: DataTypes.ENUM('Male', 'Female'),
      allowNull: true,
    },
  },
  {
    schema: 'advance',
    tableName: 'Users',
    timestamps: false,  // Disable auto-generated timestamps
  }
);
// In models/User.js
//User.hasMany(Rental, { foreignKey: 'RenterID', as: 'Rentals' }); 

module.exports = User;
