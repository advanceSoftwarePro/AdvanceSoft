const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Delivery = sequelize.define(
  'Delivery',
  {
    DeliveryID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    RentalID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: { tableName: 'Rentals', schema: 'advance' },  // Reference Rentals table
        key: 'RentalID',
      },
    },
    DeliveryStatus: {
      type: DataTypes.ENUM('Pending', 'InProgress', 'Completed', 'Failed'),
      defaultValue: 'Pending',
    },
    PickupLocation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DeliveryLocation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CurrentLatitude: {  // Current latitude of the delivery vehicle
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    CurrentLongitude: {  // Current longitude of the delivery vehicle
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    schema: 'advance',
    tableName: 'Deliveries',
    timestamps: false,  // Disable automatic timestamps
  }
);

module.exports = Delivery;
