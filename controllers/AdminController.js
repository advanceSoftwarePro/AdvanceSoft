const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

exports.getStatistics = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
}
  try {
    const result = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM "advance"."Users") AS "userCount",
        (SELECT COUNT(*) FROM "advance"."Rentals") AS "rentalCount",
        (SELECT COUNT(*) FROM "advance"."Rentals" WHERE "Status" = 'Completed') AS "completedRentals";
    `, { type: QueryTypes.SELECT });

    res.status(200).json(result[0]); 
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Error fetching statistics', details: error.message });
  }
};
