const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
    'category',
  {  
    categoryid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    categoryname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    parentcategoryid: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'categories',
    schema: 'advance',
    timestamps: false,
});

module.exports = Category;
