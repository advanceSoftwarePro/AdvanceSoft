const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenBlacklist = sequelize.define('TokenBlacklist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'UserID',  
    },
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  schema: 'advance',
  tableName: 'Token_blacklist',
  timestamps: false,
});

module.exports = TokenBlacklist;
