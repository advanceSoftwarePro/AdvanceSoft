const Delivery = require('../models/Delivery');
const Rental = require('../models/Rentals');
const Item = require('../models/Items');

// Owner creates a new delivery for a rental
exports.createDelivery = async (req, res) => {
  const { RentalID, PickupLocation, DeliveryLocation, DeliveryDate } = req.body;

  try {
    // Check if the rental exists
    const rental = await Rental.findOne({ where: { RentalID } });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Ensure the user is the owner of the item being rented
    const item = await Item.findOne({ where: { ItemID: rental.ItemID } });
    if (item.UserID !== req.user.id) {
      return res.status(403).json({ message: 'You are not the owner of this item' });
    }

    // Create the delivery record
    const delivery = await Delivery.create({
      RentalID,
      PickupLocation,
      DeliveryLocation,
      DeliveryDate,
      DeliveryStatus: 'Pending', // Default status
    });

    return res.status(201).json({ message: 'Delivery created successfully', delivery });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

/*
// Owner updates the current location of the delivery
exports.updateDeliveryLocation = async (req, res) => {
  const { id } = req.params;  // Delivery ID
  const { latitude, longitude } = req.body;  // New location

  try {
    // Find the delivery by ID
    const delivery = await Delivery.findOne({ where: { DeliveryID: id } });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Find the rental and item
    const rental = await Rental.findOne({ where: { RentalID: delivery.RentalID } });
    const item = await Item.findOne({ where: { ItemID: rental.ItemID } });

    // Ensure the logged-in user is the owner of the item
    if (item.UserID !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this delivery' });
    }

    // Update the location (latitude and longitude)
    await delivery.update({
      CurrentLatitude: latitude,
      CurrentLongitude: longitude,
    });

    return res.status(200).json({ message: 'Delivery location updated successfully', delivery });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
*/
// Renter tracks the current location of the delivery
exports.trackDeliveryLocation = async (req, res) => {
  const { id } = req.params;  // Delivery ID

  try {
    // Find the delivery by ID
    const delivery = await Delivery.findOne({ where: { DeliveryID: id } });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Find the related rental
    const rental = await Rental.findOne({ where: { RentalID: delivery.RentalID } });

    // Ensure the logged-in user is the renter
    if (rental.RenterID !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to view this delivery' });
    }

    // Check if location data is available
    if (!delivery.CurrentLatitude || !delivery.CurrentLongitude) {
      return res.status(400).json({ message: 'Location not available for this delivery yet' });
    }

    // Generate a Google Maps link using the latitude and longitude
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${delivery.CurrentLatitude},${delivery.CurrentLongitude}`;

    return res.status(200).json({
      message: 'Delivery location retrieved successfully',
      latitude: delivery.CurrentLatitude,
      longitude: delivery.CurrentLongitude,
      googleMapsLink,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Update delivery location (API for the driver to update location)
exports.updateDeliveryLocation = async (req, res) => {
  const { id } = req.params;  // Delivery ID from URL
  const { latitude, longitude } = req.body;  // Location from request body

  try {
    // Find the delivery by ID
    const delivery = await Delivery.findOne({ where: { DeliveryID: id } });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Update the location (latitude and longitude)
    await delivery.update({
      CurrentLatitude: latitude,
      CurrentLongitude: longitude,
    });

    // Broadcast the updated location to connected clients (renters and owners)
    const io = req.app.get('socketio');  // Get the Socket.IO instance
    io.emit('locationUpdate', {
      deliveryID: id,
      latitude,
      longitude,
      googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    return res.status(200).json({ message: 'Delivery location updated successfully', delivery });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Get the current delivery location (API for renter to check location)
exports.getDeliveryLocation = async (req, res) => {
  const { id } = req.params;  // Delivery ID from URL

  try {
    const delivery = await Delivery.findOne({ where: { DeliveryID: id } });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    return res.status(200).json({
      deliveryID: id,
      latitude: delivery.CurrentLatitude,
      longitude: delivery.CurrentLongitude,
      googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${delivery.CurrentLatitude},${delivery.CurrentLongitude}`,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};