const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Import sequelize instance

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
        model: { tableName: 'Users', schema: 'advance' },
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
        model: { tableName: 'Categories', schema: 'advance' },
        key: 'CategoryID',
      },
    },
    Condition: {
      type: DataTypes.ENUM('New', 'Used', 'Refurbished'),
      allowNull: false,
    },
    DailyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    SecurityDeposit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    AvailabilityStatus: {
      type: DataTypes.ENUM('Available', 'Unavailable'),
      defaultValue: 'Available',
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
    timestamps: false,
  }
);

Item.addHook('beforeUpdate', (item) => {
  item.UpdatedAt = new Date();
});

// Export the Item model first
module.exports = Item;
