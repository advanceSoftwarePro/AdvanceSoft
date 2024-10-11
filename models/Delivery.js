const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  DeliveryID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  RentalID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  PickupLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  DeliveryLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  DeliveryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  DeliveryStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  CurrentLatitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  CurrentLongitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  timestamps: false,
  schema: 'advance',
  tableName: 'Deliveries',
});

module.exports = Delivery;
