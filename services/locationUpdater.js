const Delivery = require('../models/Delivery');

const updateDeliveryLocations = async () => {
  try {
    const deliveries = await Delivery.findAll();
    deliveries.forEach(async (delivery) => {
      const newLatitude = delivery.CurrentLatitude + (Math.random() - 0.5) * 0.01; 
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
