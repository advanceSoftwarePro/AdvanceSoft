const Delivery = require('../models/Delivery');

const updateDeliveryLocations = async () => {
  try {
    // Logic to update the delivery locations (latitude and longitude)
    const deliveries = await Delivery.findAll();
    deliveries.forEach(async (delivery) => {
      // Example of updating the delivery location randomly (replace with actual logic)
      const newLatitude = delivery.CurrentLatitude + (Math.random() - 0.5) * 0.01; // Simulate change
      const newLongitude = delivery.CurrentLongitude + (Math.random() - 0.5) * 0.01;

      await delivery.update({
        CurrentLatitude: newLatitude,
        CurrentLongitude: newLongitude,
      });

      console.log(`Updated Delivery ID ${delivery.DeliveryID} to Latitude: ${newLatitude}, Longitude: ${newLongitude}`);
    });
  } catch (error) {
    console.error('Error updating delivery locations:', error);
  }
};

module.exports = { updateDeliveryLocations };
