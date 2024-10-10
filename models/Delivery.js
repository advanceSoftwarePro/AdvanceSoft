const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  "DeliveryID": {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  "RentalID": {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: { tableName: '"Rentals"', schema: 'advance' },  // Use correct case and schema
      key: '"RentalID"',  // Use correct case for foreign key reference
    },
    onDelete: 'CASCADE',
  },
  "DeliveryStatus": {
    type: DataTypes.ENUM('Pending', 'InProgress', 'Completed', 'Failed'),
    defaultValue: 'Pending',
  },
  "PickupLocation": {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  "DeliveryLocation": {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  "DeliveryDate": {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  schema: 'advance',
  tableName: '"Delivery"',  // Preserve case sensitivity with double quotes
  timestamps: false,  // Disable automatic timestamps
});

module.exports = Delivery;
