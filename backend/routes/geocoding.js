const express = require('express');
const router = express.Router();
const { geocodeAddress, reverseGeocode, searchPlaces, getRoute, getOptimizedRoute } = require('../utils/geocoding');

// @route GET /api/geocode  (was /api/geocode/geocode — BUG FIXED)
router.get('/', async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ success: false, message: 'Please provide an address' });

        const result = await geocodeAddress(address);
        if (!result) return res.status(404).json({ success: false, message: 'Address not found' });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error geocoding address', error: error.message });
    }
});

// @route GET /api/geocode/reverse
router.get('/reverse', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, message: 'Please provide lat and lng' });

        const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
        if (!result) return res.status(404).json({ success: false, message: 'Location not found' });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error reverse geocoding', error: error.message });
    }
});

// @route GET /api/geocode/search
router.get('/search', async (req, res) => {
    try {
        const { q, city } = req.query;
        if (!q) return res.status(400).json({ success: false, message: 'Please provide a search query' });

        const results = await searchPlaces(q, city);
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error searching places', error: error.message });
    }
});

// @route GET /api/routing/route
router.get('/route', async (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng } = req.query;
        if (!fromLat || !fromLng || !toLat || !toLng) {
            return res.status(400).json({ success: false, message: 'Please provide start and end coordinates' });
        }

        const route = await getRoute(parseFloat(fromLat), parseFloat(fromLng), parseFloat(toLat), parseFloat(toLng));
        if (!route) return res.status(404).json({ success: false, message: 'Route not found' });

        res.json({
            success: true,
            data: {
                distance: (route.distance / 1000).toFixed(2),
                duration: Math.round(route.duration / 60),
                geometry: route.geometry,
                steps: route.legs?.[0]?.steps || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error calculating route', error: error.message });
    }
});

// @route POST /api/routing/optimize
router.post('/optimize', async (req, res) => {
    try {
        const { coordinates } = req.body;
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
            return res.status(400).json({ success: false, message: 'Please provide at least 2 coordinates as [lng, lat] array' });
        }

        const result = await getOptimizedRoute(coordinates);
        if (!result) return res.status(404).json({ success: false, message: 'Could not optimize route' });

        res.json({
            success: true,
            data: {
                waypoints: result.waypoints,
                distance: result.route?.distance ? (result.route.distance / 1000).toFixed(2) : null,
                duration: result.route?.duration ? Math.round(result.route.duration / 60) : null,
                geometry: result.route?.geometry
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error optimizing route', error: error.message });
    }
});

module.exports = router;