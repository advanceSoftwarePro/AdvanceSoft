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

router.post('/refund/:rentalId',verifyUserToken, rentalController.refundDeposit);

router.get('/check-payment-status/:rentalId',verifyUserToken,rentalController.checkPaymentStatusAndUpdateRental);



router.get('/completed', rentalController.getCompletedRentals);

module.exports = router;
