const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mydatabase', 'postgres', 'toqatoqa123', {
    host: 'localhost',
    dialect: 'postgres', // Change based on your DB
});

module.exports = { sequelize }; // Ensure sequelize is exported like this
