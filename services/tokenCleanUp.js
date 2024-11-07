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

module.exports = {
  cleanExpiredTokens,
};


setInterval(cleanExpiredTokens, 24 * 60 * 60 * 1000); 















