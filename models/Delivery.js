const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rental = require('./Rental'); // Adjust the path as necessary
const DeliveryDriver = require('./DeliveryDriver'); // Adjust the path as necessary

const Delivery = sequelize.define('Delivery', {
  DeliveryID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  RentalID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Rental,
      key: 'RentalID', // Assuming you have a RentalID in your Rental model
    },
  },
  DriverID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DeliveryDriver,
      key: 'DriverID', // Assuming you have a DriverID in your DeliveryDriver model
    },
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
    defaultValue: 'Pending', // Default status
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

// Define associations
Delivery.associate = (models) => {
  Delivery.belongsTo(models.Rental, {
    foreignKey: 'RentalID',
    as: 'rental',
  });
  Delivery.belongsTo(models.DeliveryDriver, {
    foreignKey: 'DriverID',
    as: 'driver',
  });
};

module.exports = Delivery;
