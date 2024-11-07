const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mydatabase', 'postgres', 'toqatoqa123', {
    host: 'localhost',
    dialect: 'postgres',
});

module.exports = { sequelize }; 
