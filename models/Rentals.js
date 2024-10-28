const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Item = require('./items');

const Rentals = sequelize.define(
  'Rentals',
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
        model: { tableName: 'Items', schema: 'advance' },
        key: 'ItemID',
      },
    },
    RenterID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: { tableName: 'Users', schema: 'advance' },
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
    DeliveryOption: {
      type: DataTypes.STRING, // Ensure this matches your DB type
      allowNull: false,
    },
    DeliveryAddress: {
      type: DataTypes.STRING,
      allowNull: true,
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

// Define the relationship here
Rentals.belongsTo(Item, { foreignKey: 'ItemID', as: 'Item' });

module.exports = Rentals;
