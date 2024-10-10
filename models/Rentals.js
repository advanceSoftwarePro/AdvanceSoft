const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Item = require('./Items'); // Import the Item model

const Rental = sequelize.define(
  'Rental',
  {
    RentalID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ItemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Item, // Reference to the Item model
        key: 'ItemID',
      },
      onDelete: 'CASCADE',
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RentalStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    RentalEndDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'Rentals',
    schema: 'advance',
    timestamps: false,
  }
);

// Define associations after defining models
Rental.belongsTo(Item, { foreignKey: 'ItemID', as: 'Item' });

module.exports = Rental; // Make sure to export the model correctly
