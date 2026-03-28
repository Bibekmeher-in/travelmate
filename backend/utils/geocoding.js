const axios = require('axios');

const NOMINATIM_URL = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';
const OSRM_URL = process.env.OSRM_URL || 'https://router.project-osrm.org';

/**
 * Geocoding: Convert address to coordinates using Nominatim
 * @param {string} address - The address to geocode
 * @returns {Object} - { lat, lng, display_name }
 */
exports.geocodeAddress = async (address) => {
  try {
    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'SmartTourismBhubaneswar/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        address: result.address
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

/**
 * Reverse Geocoding: Convert coordinates to address using Nominatim
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} - Address details
 */
exports.reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'SmartTourismBhubaneswar/1.0'
      }
    });

    if (response.data) {
      return {
        display_name: response.data.display_name,
        address: response.data.address,
        lat: parseFloat(response.data.lat),
        lng: parseFloat(response.data.lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return null;
  }
};

/**
 * Search places using Nominatim
 * @param {string} query - Search query
 * @param {string} city - Optional city filter
 * @returns {Array} - Array of places
 */
exports.searchPlaces = async (query, city = 'Bhubaneswar') => {
  try {
    const searchQuery = city ? `${query}, ${city}, Odisha, India` : query;
    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params: {
        q: searchQuery,
        format: 'json',
        limit: 10,
        addressdetails: 1,
        countrycodes: 'in'
      },
      headers: {
        'User-Agent': 'SmartTourismBhubaneswar/1.0'
      }
    });

    if (response.data) {
      return response.data.map(result => ({
        place_id: result.place_id,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        type: result.type,
        address: result.address
      }));
    }
    return [];
  } catch (error) {
    console.error('Search places error:', error.message);
    return [];
  }
};

/**
 * Get route between two points using OSRM
 * @param {number} startLat - Start latitude
 * @param {number} startLng - Start longitude
 * @param {number} endLat - End latitude
 * @param {number} endLng - End longitude
 * @returns {Object} - Route details with polyline
 */
exports.getRoute = async (startLat, startLng, endLat, endLng) => {
  try {
    const response = await axios.get(`${OSRM_URL}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: true
      }
    });

    if (response.data.code === 'Ok' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        geometry: route.geometry,
        legs: route.legs,
        // Extract waypoints for the route
        waypoints: route.waypoints.map(wp => ({
          name: wp.name,
          location: wp.location
        }))
      };
    }
    return null;
  } catch (error) {
    console.error('Routing error:', error.message);
    return null;
  }
};

/**
 * Get route with multiple waypoints (optimized)
 * @param {Array} coordinates - Array of [lng, lat] coordinates
 * @returns {Object} - Optimized route
 */
exports.getOptimizedRoute = async (coordinates) => {
  try {
    if (coordinates.length < 2) {
      return null;
    }

    // Create coordinate string for trip
    const coordString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
    
    const response = await axios.get(`${OSRM_URL}/trip/v1/driving/${coordString}`, {
      params: {
        roundtrip: false,
        source: 'first',
        destination: 'last',
        overview: 'full',
        geometries: 'geojson'
      }
    });

    if (response.data.code === 'Ok' && response.data.waypoints) {
      return {
        waypoints: response.data.waypoints,
        trips: response.data.trips,
        route: response.data.trips?.[0] || null
      };
    }
    return null;
  } catch (error) {
    console.error('Route optimization error:', error.message);
    return null;
  }
};

/**
 * Calculate distance and bearing between two points
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {Object} - { distance, bearing }
 */
exports.calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  const distance = R * c;
  
  // Calculate bearing
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  
  return {
    distance: distance, // in km
    distanceMeters: distance * 1000,
    bearing: bearing
  };
};

/**
 * Find nearby places using bounding box search
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in km
 * @returns {Object} - Bounding box coordinates
 */
exports.getBoundingBox = (lat, lng, radius) => {
  const R = 6371;
  const latDelta = (radius / R) * (180 / Math.PI);
  const lngDelta = (radius / R) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
  
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta
  };
};