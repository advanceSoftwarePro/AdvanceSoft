const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { verifyUserToken } = require('../utils/authMiddleware');

// Existing routes...
router.post('/deliveries',verifyUserToken, deliveryController.createDelivery);
router.get('/deliveries/:id', verifyUserToken,deliveryController.getDelivery);
router.get('/deliveries/location/:id', verifyUserToken,deliveryController.getDeliveryLocationForCustomer); // New route
//router.put('/deliveries/location', verifyUserToken,deliveryController.updateDeliveryLocation);
router.delete('/deliveries/:id',verifyUserToken, deliveryController.deleteDelivery);

router.get('/complete-delivery', deliveryController.completeDelivery);

module.exports = router;

