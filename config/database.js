const { Sequelize } = require('sequelize');
require('dotenv').config();  // Load environment variables from .env

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Database name
  process.env.DB_USER,      // Database user
  process.env.DB_PASSWORD,  // Database password
  {
    host: process.env.DB_HOST,  // Database host
    dialect: 'postgres',        // Database dialect (PostgreSQL)
    logging: process.env.NODE_ENV === 'development' ? console.log : false,  // Enable logging only in development
  }
);

// Test the connection to the database
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
  } catch (err) {
    console.error('Unable to connect to database:', err);
  }
}

testConnection();  // Call the testConnection function to verify database connection

module.exports = sequelize;
