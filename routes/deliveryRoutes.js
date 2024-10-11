const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { verifyUserToken } = require('../utils/authMiddleware');

// Owner creates a new delivery
router.post('/', verifyUserToken, deliveryController.createDelivery);

// Owner updates the delivery's current location
router.put('/:id/location', verifyUserToken, deliveryController.updateDeliveryLocation);

// Renter tracks the delivery's current location
router.get('/:id/location', verifyUserToken, deliveryController.getDeliveryLocation);


module.exports = router;
