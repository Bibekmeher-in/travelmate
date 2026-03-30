import axios from 'axios';

const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;
const OSRM_URL = 'https://router.project-osrm.org';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

// Separate axios instances without interceptors for external APIs
const osrmAxios = axios.create();
const nominatimAxios = axios.create();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token but don't force redirect — let React Router handle it
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Geocoding API
export const geocodeAPI = {
  // Convert address to coordinates
  geocode: (address) => nominatimAxios.get(`${NOMINATIM_URL}/search`, {
    params: {
      q: address,
      format: 'json',
      limit: 1,
      addressdetails: 1,
      countrycodes: 'in'
    },
    headers: {
      'User-Agent': 'SmartTourismBhubaneswar/1.0'
    }
  }),
  
  // Convert coordinates to address
  reverseGeocode: (lat, lng) => nominatimAxios.get(`${NOMINATIM_URL}/reverse`, {
    params: {
      lat,
      lon: lng,
      format: 'json',
      addressdetails: 1
    },
    headers: {
      'User-Agent': 'SmartTourismBhubaneswar/1.0'
    }
  }),
  
  // Search places
  searchPlaces: (query, city = 'Bhubaneswar') => nominatimAxios.get(`${NOMINATIM_URL}/search`, {
    params: {
      q: `${query}, ${city}, Odisha, India`,
      format: 'json',
      limit: 10,
      addressdetails: 1,
      countrycodes: 'in'
    },
    headers: {
      'User-Agent': 'SmartTourismBhubaneswar/1.0'
    }
  })
};

// Routing API - OSRM
export const routingAPI = {
  // Get route between two points
  getRoute: (fromLat, fromLng, toLat, toLng) =>
    osrmAxios.get(`${OSRM_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}`, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: true
      }
    }),

  // Get optimized route for multiple waypoints
  getOptimizedRoute: (coordinates) => {
    const coordString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
    return osrmAxios.get(`${OSRM_URL}/trip/v1/driving/${coordString}`, {
      params: {
        roundtrip: false,
        source: 'first',
        destination: 'last',
        overview: 'full',
        geometries: 'geojson'
      }
    });
  }
};

// Places API
export const placesAPI = {
  getAll: (params) => api.get('/places', { params }),
  getNearby: (params) => api.get('/places/nearby', { params }),
  getFeed: (params) => api.get('/places/feed', { params }),
  getById: (id) => api.get(`/places/${id}`),
  getCategories: () => api.get('/places/categories'),
  getNearbyAttractions: (id) => api.get(`/places/${id}/nearby`)
};

// Hotels API
export const hotelsAPI = {
  getAll: (params) => api.get('/hotels', { params }),
  getNearby: (params) => api.get('/hotels/nearby', { params }),
  getById: (id) => api.get(`/hotels/${id}`)
};

// Restaurants API
export const restaurantsAPI = {
  getAll: (params) => api.get('/restaurants', { params }),
  getNearby: (params) => api.get('/restaurants/nearby', { params }),
  getById: (id) => api.get(`/restaurants/${id}`)
};

// Emergency API
export const emergencyAPI = {
  getNearby: (params) => api.get('/emergency/nearby', { params }),
  getNumbers: () => api.get('/emergency/numbers')
};

// Transport API
export const transportAPI = {
  estimateFare: (params) => api.get('/transport/fare', { params }),
  getFromUser: (params) => api.get('/transport/from-user', { params }),
  getRoute: (params) => api.get('/transport/route', { params })
};

// AI API
export const aiAPI = {
  planTrip: (data) => api.post('/ai/trip-planner', data),
  calculateBudget: (data) => api.post('/ai/budget-calculator', data),
  getRecommendations: (params) => api.get('/ai/recommendations', { params }),
  saveTrip: (data) => api.post('/ai/save-trip', data),
  getMyTrips: () => api.get('/ai/my-trips'),
  chat: (data) => api.post('/ai/chat', data)
};

// Weather API
export const weatherAPI = {
  getCurrent: (params) => api.get('/weather', { params })
};

export default api;
