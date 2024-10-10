// models/Rental.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rental = sequelize.define(
  'Rental',
  {
    RentalID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ItemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: { tableName: 'Items', schema: 'advance' },  // Reference to Items table
        key: 'ItemID',
      },
    },
    RenterID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: { tableName: 'Users', schema: 'advance' },  // Reference to Users table
        key: 'UserID',
      },
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    TotalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    Status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed'),
      defaultValue: 'Pending',
    },
  },
  {
    schema: 'advance',
    tableName: 'Rentals',
    timestamps: false,
  }
);

module.exports = Rental;
