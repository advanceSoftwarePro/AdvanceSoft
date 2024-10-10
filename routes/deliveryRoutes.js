const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Route to create a new delivery
router.post('/deliveries', deliveryController.createDelivery);

// Route to update delivery status
router.put('/deliveries/:id', deliveryController.updateDeliveryStatus);

// Route to get all deliveries
router.get('/deliveries', deliveryController.getAllDeliveries);

// Route to get a delivery by ID
router.get('/deliveries/:id', deliveryController.getDeliveryById);

// Route to delete a delivery
router.delete('/deliveries/:id', deliveryController.deleteDelivery);

module.exports = router;
