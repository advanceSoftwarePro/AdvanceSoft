const axios = require('axios');

const geocodeAddress = async (address) => {
    const apiKey = 'VI4bFgW3DAiW6Cr4L2ezNBY3KHa3dTZqvcMlbwwygTA'; // Replace with your HERE API key
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${apiKey}`;
  
    try {
      const response = await axios.get(url);
      console.log('API Response:', response.data); // Log the full response for debugging
  
      // Check if the response has items
      if (response.data && Array.isArray(response.data.items) && response.data.items.length > 0) {
        const location = response.data.items[0].position; // Get the first result
        return {
          lat: location.lat,
          lng: location.lng
        };
      } else {
        console.error('No items found in the response');
        return null; // Return null if no valid location found
      }
    } catch (error) {
      console.error('Error fetching geocode:', error.response ? error.response.data : error.message);
      return null; // Return null in case of an error
    }
  };
  


const getRoute = async (pickupCoords, deliveryCoords) => {
    const apiKey = 'uQ2yyC1V-Y3Zchr7DF0GXx_uxaBStKbvnF2ojdDNZ6c'; // Replace with your HERE API key
    const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${pickupCoords.lat},${pickupCoords.lng}&destination=${deliveryCoords.lat},${deliveryCoords.lng}&return=summary&apikey=${apiKey}`;
  
    try {
      const response = await axios.get(url); // Make the API request to HERE Routing API
      if (response.data.routes && response.data.routes.length > 0) {
        // Check if any routes were returned
        return response.data.routes[0].sections[0].summary; // Return the summary of the first route section
      }
      return null; // Return null if no valid route found
    } catch (error) {
      console.error('Error fetching route:', error); // Log any errors encountered
      return null; // Return null in case of an error
    }
  };
  
  module.exports = { geocodeAddress
    ,getRoute };