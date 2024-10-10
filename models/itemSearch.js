const { Op } = require('sequelize'); // Import Op for Sequelize operators
const Item = require('./Items'); // Import the existing Item model

// Search function to find items based on a query
const searchItems = async (searchQuery) => {
  try {
    return await Item.findAll({
      where: {
        Title: {
          [Op.like]: `%${searchQuery}%`, // Searching by Title
        },
      },
    });
  } catch (error) {
    console.error('Error searching items:', error);
    throw error; // Rethrow the error to handle it in the controller
  }
};

module.exports = {
  searchItems,
};
