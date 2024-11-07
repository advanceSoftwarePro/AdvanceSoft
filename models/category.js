const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
  'Category',  
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
          tableName: '"Categories"',  
          schema: 'advance',  
        },
        key: '"CategoryID"',    
      },
      onDelete: 'CASCADE',  
      onUpdate: 'CASCADE',
    },
  },
  {
    tableName: '"Categories"',  
    schema: 'advance',  
    timestamps: false,  
  }
);

module.exports = Category;
