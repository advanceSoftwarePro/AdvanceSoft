const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
  'Category',  // Model name
  {  
    "CategoryID": {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    "CategoryName": {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    "ParentCategoryID": {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: {
          tableName: '"Categories"',  // Reference the same table with correct case
          schema: 'advance',  // Ensure it uses the correct schema
        },
        key: '"CategoryID"',    // Foreign key reference to the CategoryID field
      },
      onDelete: 'CASCADE',  // Optional: if a parent category is deleted, delete child categories
      onUpdate: 'CASCADE',
    },
  },
  {
    tableName: '"Categories"',  // Use double quotes to preserve the table name case
    schema: 'advance',  // Schema where this table resides
    timestamps: false,  // Disable timestamps (no createdAt or updatedAt)
  }
);

module.exports = Category;
