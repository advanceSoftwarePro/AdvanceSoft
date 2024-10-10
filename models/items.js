const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rental = require('./Rentals');  // Import the Rental model

const Item = sequelize.define(
  'Item',
  {
    ItemID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: { tableName: 'Users', schema: 'advance' },  // Reference to Users table
        key: 'UserID',
      },
      onDelete: 'CASCADE',
    },
    Title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    CategoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: { tableName: 'Categories', schema: 'advance' },  // Reference to Categories table
        key: 'CategoryID',
      },
    },
    Condition: {
      type: DataTypes.ENUM('New', 'Used', 'Refurbished'),  // Correct way to define ENUM
      allowNull: false,
    },
    DailyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    SecurityDeposit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    AvailabilityStatus: {
      type: DataTypes.ENUM('Available', 'Unavailable'),
      defaultValue: 'Available',
    },
    DeliveryOptions: {
      type: DataTypes.ENUM('Pickup', 'Delivery'),
      defaultValue: 'Pickup',
    },
    ImageURL: {
      type: DataTypes.STRING(255),
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    tableName: 'Items',
    schema: 'advance',
    timestamps: false,  // Disable Sequelize's automatic timestamps
  }
);

// Hook to automatically update the `UpdatedAt` field
Item.addHook('beforeUpdate', (item) => {
  item.UpdatedAt = new Date();
});
Item.hasMany(Rental, { foreignKey: 'ItemID' });
Rental.belongsTo(Item, { foreignKey: 'ItemID', as: 'Item' });

module.exports = Item;
