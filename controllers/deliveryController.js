const Delivery = require('../models/Delivery');

// Controller for creating a new delivery
exports.createDelivery = async (req, res) => {
  try {
    const { RentalID, PickupLocation, DeliveryLocation, DeliveryDate } = req.body;

    // Create a new delivery
    const newDelivery = await Delivery.create({
      RentalID,
      PickupLocation,
      DeliveryLocation,
      DeliveryDate,
    });

    res.status(201).json(newDelivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for updating delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Update delivery status
    const updatedDelivery = await delivery.update({
      DeliveryStatus: req.body.DeliveryStatus,
    });

    res.status(200).json(updatedDelivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for getting all deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll();
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for getting delivery by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (delivery) {
      res.status(200).json(delivery);
    } else {
      res.status(404).json({ message: 'Delivery not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a delivery (if needed)
exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    await delivery.destroy();
    res.status(200).json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
