const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rental = require('./Rental'); 
const DeliveryDriver = require('./DeliveryDriver'); 

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
      key: 'RentalID', 
    },
  },
  DriverID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DeliveryDriver,
      key: 'DriverID', 
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
    defaultValue: 'Pending', 
  },
  currentLocation: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  
}, {
  timestamps: false,
  schema: 'advance',
  tableName: 'Deliveries',
});

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
