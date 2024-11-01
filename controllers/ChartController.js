// controllers/ChartController.js

const User = require('../models/User');
const Rental = require('../models/Rental');

exports.getChartData = async (req, res) => {
  try {
    const userCount = await User.count();
    const rentalCount = await Rental.count();
    const completedRentals = await Rental.count({ where: { Status: 'Completed' } });

    res.status(200).json({
      labels: ['Users', 'Rentals', 'Completed Rentals'],
      datasets: [
        {
          label: 'Counts',
          data: [userCount, rentalCount, completedRentals],
          backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40'],
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Error fetching chart data' });
  }
};
