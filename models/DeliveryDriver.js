const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path as necessary

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
  timestamps: false, // Disable automatic timestamp fields
  schema: 'advance',
  tableName: 'DeliveryDrivers',
});

// Define hooks to automatically update the UpdatedAt field
DeliveryDriver.addHook('beforeUpdate', (driver) => {
  driver.UpdatedAt = new Date();
});

DeliveryDriver.associate = (models) => {
  DeliveryDriver.hasMany(models.Delivery, {
    foreignKey: 'DriverID',
    as: 'deliveries', // Ensure this matches your query
  });
};
module.exports = DeliveryDriver;
