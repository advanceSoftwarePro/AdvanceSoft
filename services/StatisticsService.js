const User = require('../models/user');  // Adjust the path if needed
const Rental = require('../models/Rental');  // Adjust the path if needed

// Function to get statistics data
exports.getStatistics = async () => {
  try {
    const userCount = await User.count();
    const rentalCount = await Rental.count();
    const completedRentals = await Rental.count({ where: { Status: 'Completed' } });
    return { userCount, rentalCount, completedRentals };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};
