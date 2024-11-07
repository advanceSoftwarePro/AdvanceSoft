const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const DeliveryDriver = sequelize.define('DeliveryDriver', {
  DriverID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  Area: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Status: {
    type: DataTypes.STRING(10),
    defaultValue: 'Active',
  },
 
}, {
  timestamps: false, 
  schema: 'advance',
  tableName: 'DeliveryDrivers',
});

DeliveryDriver.addHook('beforeUpdate', (driver) => {
  driver.UpdatedAt = new Date();
});

DeliveryDriver.associate = (models) => {
  DeliveryDriver.hasMany(models.Delivery, {
    foreignKey: 'DriverID',
    as: 'deliveries', 
  });
};
module.exports = DeliveryDriver;
