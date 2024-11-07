const axios = require('axios');
const geocodeAddress = async (address) => {
  const apiKey = 'VI4bFgW3DAiW6Cr4L2ezNBY3KHa3dTZqvcMlbwwygTA'; 
  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    console.log('Geocode API Response:', response.data); 
    
    if (response.data && Array.isArray(response.data.items) && response.data.items.length > 0) {
      const location = response.data.items[0].position;
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error('No items found in the geocoding response');
      return null;
    }
  } catch (error) {
    console.error('Error fetching geocode:', error.response ? error.response.data : error.message);
    return null;
  }
};

const getRoute = async (pickupCoords, deliveryCoords) => {
  const apiKey = 'uQ2yyC1V-Y3Zchr7DF0GXx_uxaBStKbvnF2ojdDNZ6c'; 
  const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${pickupCoords.lat},${pickupCoords.lng}&destination=${deliveryCoords.lat},${deliveryCoords.lng}&return=summary&apikey=${apiKey}`;

  try {
      const response = await axios.get(url); 
      if (response.data.routes && response.data.routes.length > 0) {
          const routeSummary = response.data.routes[0].sections[0].summary; 
          console.log('Route Summary:', routeSummary);
          return routeSummary; 
      }
      console.error('No routes found for these coordinates:', pickupCoords, deliveryCoords);
      return null; 
  } catch (error) {
      console.error('Error fetching route:', error.response ? error.response.data : error.message); 
      return null; 
  }
};

module.exports = { geocodeAddress, getRoute };
