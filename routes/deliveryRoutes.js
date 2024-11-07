const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { verifyUserToken } = require('../utils/authMiddleware');
router.post('/deliveries',verifyUserToken, deliveryController.createDelivery);
router.get('/deliveries/:id', verifyUserToken,deliveryController.getDelivery);
router.get('/deliveries/location/:id', verifyUserToken,deliveryController.getDeliveryLocationForCustomer);
router.delete('/deliveries/:id',verifyUserToken, deliveryController.deleteDelivery);


module.exports = router;

