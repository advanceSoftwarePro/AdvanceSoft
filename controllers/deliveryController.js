const Delivery = require('../models/Delivery');
const { Op } = require('sequelize');
const path = require('path');

// Function to create a new delivery
const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    //Delivery.save();
    return res.status(201).json(delivery);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Function to get delivery details
const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    return res.status(200).json(delivery);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Function to update delivery location

// Function to update the current location of a delivery
/*const updateDeliveryLocation = async (req, res) => {
  const { DeliveryID, CurrentLatitude, CurrentLongitude } = req.body;

  try {
    const delivery = await Delivery.findByPk(DeliveryID);
    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    // Update the location fields
    delivery.CurrentLatitude = CurrentLatitude;
    delivery.CurrentLongitude = CurrentLongitude;

    await delivery.save();
    return res.status(200).json({
      message: "Location updated successfully",
      delivery,
    });
  } catch (error) {
    console.error("Error updating delivery location:", error);
    return res.status(500).json({ error: error.message });
  }
};*/


// Function to delete a delivery
const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    await delivery.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getDeliveryLocationForCustomer = async (req, res) => {
  try {
    // Check if the user is a customer
    if (req.user.role !== 'Renter') {
      return res.status(403).json({ message: 'Access denied. Only customers can view delivery locations.' });
    }

    const deliveryID = req.params.id;

    // Find the delivery by ID
    const delivery = await Delivery.findByPk(deliveryID);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Generate the Google Maps link
    const googleMapsLink = `https://www.google.com/maps/dir//${delivery.CurrentLatitude},${delivery.CurrentLongitude}/`;

    // Respond with the delivery location details
    return res.status(200).json({
      PickupLocation: delivery.PickupLocation,
      DeliveryLocation: delivery.DeliveryLocation,
      CurrentLatitude: delivery.CurrentLatitude,
      CurrentLongitude: delivery.CurrentLongitude,
      GoogleMapsLink: googleMapsLink,  // Include the Google Maps link
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDelivery,
  getDelivery,
  getDeliveryLocationForCustomer,
  updateDeliveryLocation,
  deleteDelivery,
};