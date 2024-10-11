
// services/tokenCleanUp.js
const { Op } = require('sequelize');
const TokenBlacklist = require('../models/tokenBlacklist');

const cleanExpiredTokens = async () => {
  try {
    const now = new Date();
    await TokenBlacklist.destroy({
      where: {
        expiresAt: {
          [Op.lt]: now,
        },
      },
    });
    console.log('Expired tokens cleaned up.');
  } catch (err) {
    console.error('Error cleaning expired tokens:', err);
  }
};

// Export the cleanup function
module.exports = {
  cleanExpiredTokens,
};

// Optionally: Run this cleanup function once a day
setInterval(cleanExpiredTokens, 24 * 60 * 60 * 1000); // Clean up once every 24 hours















