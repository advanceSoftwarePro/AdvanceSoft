const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Item = sequelize.define(
    'Item', {
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
        field: 'CategoryID',  // the database column name
        references: {
          model: { tableName: 'categories', schema: 'advance' },  
          key: 'CategoryID',  // Match the primary key of the Categories table
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
      allowNull: true,  // Allow null values for initial creation
    },
  },
    {
      tableName: 'Items',  
      schema: 'advance',  
      timestamps: false,  // Disable automatic timestamps
    }
);

//  to automatically update the UpdatedAt field
Item.addHook('beforeUpdate', (item) => {
  item.UpdatedAt = new Date();
});

module.exports = Item;
