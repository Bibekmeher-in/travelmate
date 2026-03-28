const Place = require('../models/Place');

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

// @desc    Get nearby places using manual distance calculation
// @route   GET /api/places/nearby
// @access  Public
exports.getNearbyPlaces = async (req, res) => {
    try {
        const { lat, lng, radius = 5000, category, sort = 'distance', minRating } = req.query;

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
        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }

        // Get all places and filter manually
        const places = await Place.find(query).lean();

        // Calculate distance for each place and filter by radius
        let placesWithDistance = places
            .map(place => {
                const placeLat = place.location.coordinates[1];
                const placeLng = place.location.coordinates[0];
                const distance = calculateDistance(userLat, userLng, placeLat, placeLng);
                return {
                    ...place,
                    distance: distance * 1000, // in meters for compatibility
                    distanceKm: parseFloat(distance.toFixed(2))
                };
            })
            .filter(place => place.distanceKm <= maxRadiusKm);

        // Sort based on parameter
        if (sort === 'rating') {
            placesWithDistance.sort((a, b) => b.rating - a.rating);
        } else if (sort === 'popularity') {
            placesWithDistance.sort((a, b) => b.popularity - a.popularity);
        } else {
            placesWithDistance.sort((a, b) => a.distance - b.distance);
        }

        res.json({
            success: true,
            count: placesWithDistance.length,
            data: placesWithDistance
        });
    } catch (error) {
        console.error('Get nearby places error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching nearby places',
            error: error.message
        });
    }
};

// @desc    Get smart feed with sections
// @route   GET /api/places/feed
// @access  Public
exports.getSmartFeed = async (req, res) => {
    try {
        const { lat, lng, radius = 10000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude and longitude'
            });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const maxRadiusKm = 5; // 5km for explore nearby

        // Get all places
        const allPlaces = await Place.find({}).lean();

        // Calculate distances for all places
        const placesWithDistance = allPlaces.map(place => {
            const placeLat = place.location.coordinates[1];
            const placeLng = place.location.coordinates[0];
            const distance = calculateDistance(userLat, userLng, placeLat, placeLng);
            return {
                ...place,
                distanceKm: parseFloat(distance.toFixed(2))
            };
        });

        // Explore Nearby - places within 5km sorted by distance
        const exploreNearby = placesWithDistance
            .filter(place => place.distanceKm <= maxRadiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 20);

        // Trending in Bhubaneswar
        const trending = placesWithDistance
            .filter(place => place.isTrending)
            .sort((a, b) => b.popularity - a.popularity || b.rating - a.rating)
            .slice(0, 10);

        // Recommended based on rating + popularity
        const recommended = placesWithDistance
            .sort((a, b) => b.rating - a.rating || b.popularity - a.popularity)
            .slice(0, 15);

        res.json({
            success: true,
            data: {
                exploreNearby,
                trending,
                recommended
            }
        });
    } catch (error) {
        console.error('Get smart feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching smart feed',
            error: error.message
        });
    }
};

// @desc    Get single place
// @route   GET /api/places/:id
// @access  Public
exports.getPlace = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'Place not found'
            });
        }

        res.json({
            success: true,
            data: place
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching place',
            error: error.message
        });
    }
};

// @desc    Get all places with filters
// @route   GET /api/places
// @access  Public
exports.getAllPlaces = async (req, res) => {
    try {
        const {
            category,
            sort = 'rating',
            page = 1,
            limit = 20,
            minRating,
            search
        } = req.query;

        let query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOption = sort === 'popularity'
            ? { popularity: -1 }
            : sort === 'rating'
                ? { rating: -1 }
                : { createdAt: -1 };

        const places = await Place.find(query)
            .sort(sortOption)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Place.countDocuments(query);

        res.json({
            success: true,
            count: places.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: places
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching places',
            error: error.message
        });
    }
};

// @desc    Create place (Admin)
// @route   POST /api/places
// @access  Private/Admin
exports.createPlace = async (req, res) => {
    try {
        const place = await Place.create(req.body);

        res.status(201).json({
            success: true,
            data: place
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating place',
            error: error.message
        });
    }
};

// @desc    Update place (Admin)
// @route   PUT /api/places/:id
// @access  Private/Admin
exports.updatePlace = async (req, res) => {
    try {
        const place = await Place.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'Place not found'
            });
        }

        res.json({
            success: true,
            data: place
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating place',
            error: error.message
        });
    }
};

// @desc    Delete place (Admin)
// @route   DELETE /api/places/:id
// @access  Private/Admin
exports.deletePlace = async (req, res) => {
    try {
        const place = await Place.findByIdAndDelete(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'Place not found'
            });
        }

        res.json({
            success: true,
            message: 'Place deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting place',
            error: error.message
        });
    }
};

// @desc    Get nearby attractions for a place
// @route   GET /api/places/:id/nearby
// @access  Public
exports.getNearbyAttractions = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'Place not found'
            });
        }

        const placeLat = place.location.coordinates[1];
        const placeLng = place.location.coordinates[0];

        // Get all places except current one and hospitals
        const allPlaces = await Place.find({
            _id: { $ne: place._id },
            category: { $ne: 'hospital' }
        }).lean();

        // Calculate distances and filter
        const attractions = allPlaces
            .map(p => {
                const distance = calculateDistance(
                    placeLat, placeLng,
                    p.location.coordinates[1], p.location.coordinates[0]
                );
                return {
                    ...p,
                    distance: distance * 1000,
                    distanceKm: parseFloat(distance.toFixed(2))
                };
            })
            .filter(p => p.distanceKm <= 3) // Within 3km
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10);

        res.json({
            success: true,
            data: attractions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching nearby attractions',
            error: error.message
        });
    }
};

// @desc    Get categories list
// @route   GET /api/places/categories
// @access  Public
exports.getCategories = async (req, res) => {
    const categories = [
        { id: 'temple', name: 'Temples', icon: '🛕' },
        { id: 'tourist_place', name: 'Tourist Places', icon: '🏛️' },
        { id: 'park', name: 'Parks', icon: '🌳' },
        { id: 'mall', name: 'Malls', icon: '🏬' },
        { id: 'hotel', name: 'Hotels', icon: '🏨' },
        { id: 'restaurant', name: 'Restaurants', icon: '🍽️' },
        { id: 'cafe', name: 'Cafes', icon: '☕' },
        { id: 'museum', name: 'Museums', icon: '🏛️' },
        { id: 'historical', name: 'Historical Places', icon: '📜' },
        { id: 'shopping', name: 'Shopping Areas', icon: '🛍️' }
    ];

    res.json({
        success: true,
        data: categories
    });
};