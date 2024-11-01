const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { verifyUserToken } = require('../utils/authMiddleware');

// Create a rental (only Renters can do this)
router.post('/', verifyUserToken, rentalController.createRental);

// Get all rentals (for Renters or Owners)
router.get('/', verifyUserToken, rentalController.getAllRentals);

// Update rental status (Owner/Admin action)
router.put('/:id/status', verifyUserToken, rentalController.updateRentalStatus);

module.exports = router;
