const User = require('../models/user');  
const Rental = require('../models/Rental');  
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
