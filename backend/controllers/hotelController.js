const Hotel = require('../models/Hotel');

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

// @desc    Get nearby hotels
// @route   GET /api/hotels/nearby
// @access  Public
exports.getNearbyHotels = async (req, res) => {
    try {
        const { lat, lng, radius = 10000, minPrice, maxPrice, category } = req.query;

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
        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query['price.min'] = {};
            if (minPrice) query['price.min'].$gte = parseInt(minPrice);
            if (maxPrice) query['price.max'] = { $lte: parseInt(maxPrice) };
        }

        // Get all hotels and filter manually
        const hotels = await Hotel.find(query).lean();

        // Calculate distance for each hotel and filter by radius
        const hotelsWithDistance = hotels
            .map(hotel => {
                const hotelLat = hotel.location.coordinates[1];
                const hotelLng = hotel.location.coordinates[0];
                const distance = calculateDistance(userLat, userLng, hotelLat, hotelLng);
                return {
                    ...hotel,
                    distance: distance * 1000,
                    distanceKm: parseFloat(distance.toFixed(2))
                };
            })
            .filter(hotel => hotel.distanceKm <= maxRadiusKm)
            .sort((a, b) => b.rating - a.rating);

        res.json({
            success: true,
            count: hotelsWithDistance.length,
            data: hotelsWithDistance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching hotels',
            error: error.message
        });
    }
};

// @desc    Get all hotels with filters
// @route   GET /api/hotels
// @access  Public
exports.getAllHotels = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sort = 'rating', page = 1, limit = 20 } = req.query;

        let query = {};

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query['price.min'] = {};
            if (minPrice) query['price.min'].$gte = parseInt(minPrice);
            if (maxPrice) query['price.max'] = { $lte: parseInt(maxPrice) };
        }

        const hotels = await Hotel.find(query)
            .sort(sort === 'price' ? { 'price.min': 1 } : { rating: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Hotel.countDocuments(query);

        res.json({
            success: true,
            count: hotels.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: hotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching hotels',
            error: error.message
        });
    }
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }

        res.json({
            success: true,
            data: hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching hotel',
            error: error.message
        });
    }
};

// @desc    Create hotel (Admin)
// @route   POST /api/hotels
// @access  Private/Admin
exports.createHotel = async (req, res) => {
    try {
        const hotel = await Hotel.create(req.body);

        res.status(201).json({
            success: true,
            data: hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating hotel',
            error: error.message
        });
    }
};

// @desc    Update hotel (Admin)
// @route   PUT /api/hotels/:id
// @access  Private/Admin
exports.updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }

        res.json({
            success: true,
            data: hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating hotel',
            error: error.message
        });
    }
};

// @desc    Delete hotel (Admin)
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }

        res.json({
            success: true,
            message: 'Hotel deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting hotel',
            error: error.message
        });
    }
};