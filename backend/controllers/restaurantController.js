const Restaurant = require('../models/Restaurant');

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// @desc    Get nearby restaurants
// @route   GET /api/restaurants/nearby
// @access  Public
exports.getNearbyRestaurants = async (req, res) => {
    try {
        const { lat, lng, radius = 5000, category, priceRange } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude and longitude'
            });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const maxRadiusKm = parseInt(radius) / 1000;

        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }
        if (priceRange) {
            query.priceRange = priceRange;
        }

        // Get all restaurants and filter manually
        const restaurants = await Restaurant.find(query).lean();

        // Calculate distance for each restaurant and filter by radius
        const restaurantsWithDistance = restaurants
            .map(restaurant => {
                const restaurantLat = restaurant.location.coordinates[1];
                const restaurantLng = restaurant.location.coordinates[0];
                const distance = calculateDistance(userLat, userLng, restaurantLat, restaurantLng);
                return {
                    ...restaurant,
                    distance: distance * 1000,
                    distanceKm: parseFloat(distance.toFixed(2))
                };
            })
            .filter(restaurant => restaurant.distanceKm <= maxRadiusKm)
            .sort((a, b) => b.rating - a.rating);

        res.json({
            success: true,
            count: restaurantsWithDistance.length,
            data: restaurantsWithDistance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurants',
            error: error.message
        });
    }
};

// @desc    Get all restaurants with filters
// @route   GET /api/restaurants
// @access  Public
exports.getAllRestaurants = async (req, res) => {
    try {
        const { category, priceRange, cuisine, sort = 'rating', page = 1, limit = 20 } = req.query;

        let query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (priceRange) {
            query.priceRange = priceRange;
        }

        if (cuisine) {
            query.cuisine = { $in: cuisine };
        }

        const restaurants = await Restaurant.find(query)
            .sort(sort === 'rating' ? { rating: -1 } : { popularity: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Restaurant.countDocuments(query);

        res.json({
            success: true,
            count: restaurants.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: restaurants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurants',
            error: error.message
        });
    }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        res.json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurant',
            error: error.message
        });
    }
};

// @desc    Create restaurant (Admin)
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.create(req.body);

        res.status(201).json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating restaurant',
            error: error.message
        });
    }
};

// @desc    Update restaurant (Admin)
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        res.json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating restaurant',
            error: error.message
        });
    }
};

// @desc    Delete restaurant (Admin)
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        res.json({
            success: true,
            message: 'Restaurant deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting restaurant',
            error: error.message
        });
    }
};