const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { verifyUserToken } = require('../utils/authMiddleware');

router.post('/', verifyUserToken, rentalController.createRental);
router.get('/', verifyUserToken, rentalController.getAllRentals);
router.put('/:id/status', verifyUserToken, rentalController.updateRentalStatus);
router.post('/refund/:rentalId',verifyUserToken, rentalController.refundDeposit);
router.get('/check-payment-status/:rentalId',verifyUserToken,rentalController.checkPaymentStatusAndUpdateRental);
router.get('/rentals/completed', rentalController.getCompletedRentals);

module.exports = router;
