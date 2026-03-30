const Restaurant = require('../models/Restaurant');

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const safeCoords = (item) => {
    const c = item?.location?.coordinates;
    return Array.isArray(c) && c.length >= 2 ? { lat: c[1], lng: c[0] } : null;
};

// @route GET /api/restaurants/nearby
exports.getNearbyRestaurants = async (req, res) => {
    try {
        const { lat, lng, radius = 50000, category, priceRange } = req.query;

        if (!lat || !lng) return res.status(400).json({ success: false, message: 'Please provide lat and lng' });

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        if (isNaN(userLat) || isNaN(userLng)) return res.status(400).json({ success: false, message: 'Invalid lat/lng values' });

        const maxRadiusKm = parseFloat(radius) / 1000;
        let query = {};
        if (category && category !== 'all') query.category = category;
        if (priceRange) query.priceRange = priceRange;

        const restaurants = await Restaurant.find(query).lean();

        const result = restaurants
            .filter(r => safeCoords(r) !== null)
            .map(restaurant => {
                const { lat: rLat, lng: rLng } = safeCoords(restaurant);
                const distance = calculateDistance(userLat, userLng, rLat, rLng);
                return { ...restaurant, distance: distance * 1000, distanceKm: parseFloat(distance.toFixed(2)) };
            })
            .filter(r => r.distanceKm <= maxRadiusKm)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0));

        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        console.error('getNearbyRestaurants error:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching restaurants', error: error.message });
    }
};

// @route GET /api/restaurants
exports.getAllRestaurants = async (req, res) => {
    try {
        const { category, priceRange, cuisine, sort = 'rating', page = 1, limit = 20 } = req.query;

        let query = {};
        if (category && category !== 'all') query.category = category;
        if (priceRange) query.priceRange = priceRange;
        if (cuisine) query.cuisine = { $in: Array.isArray(cuisine) ? cuisine : [cuisine] };

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const sortOption = sort === 'rating' ? { rating: -1 } : { popularity: -1 };

        const [restaurants, total] = await Promise.all([
            Restaurant.find(query).sort(sortOption).limit(limitNum).skip((pageNum - 1) * limitNum).lean(),
            Restaurant.countDocuments(query)
        ]);

        res.json({ success: true, count: restaurants.length, total, page: pageNum, pages: Math.ceil(total / limitNum), data: restaurants });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching restaurants', error: error.message });
    }
};

// @route GET /api/restaurants/:id
exports.getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
        res.json({ success: true, data: restaurant });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
        res.status(500).json({ success: false, message: 'Error fetching restaurant', error: error.message });
    }
};

// @route POST /api/restaurants
exports.createRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.create(req.body);
        res.status(201).json({ success: true, data: restaurant });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error creating restaurant', error: error.message });
    }
};

// @route PUT /api/restaurants/:id
exports.updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
        res.json({ success: true, data: restaurant });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error updating restaurant', error: error.message });
    }
};

// @route DELETE /api/restaurants/:id
exports.deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
        res.json({ success: true, message: 'Restaurant deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
        res.status(500).json({ success: false, message: 'Error deleting restaurant', error: error.message });
    }
};