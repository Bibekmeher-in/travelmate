const Place = require('../models/Place');

// Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Safe coordinate extractor — returns null if place has no valid location
const getCoords = (place) => {
    const coords = place?.location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;
    return { lat: coords[1], lng: coords[0] };
};

// @route GET /api/places/nearby
exports.getNearbyPlaces = async (req, res) => {
    try {
        const { lat, lng, radius = 500000, category, sort = 'distance', minRating } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Please provide lat and lng' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const maxRadiusKm = parseFloat(radius) / 1000;

        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({ success: false, message: 'Invalid lat/lng values' });
        }

        let query = {};
        if (category && category !== 'all') query.category = category;
        if (minRating && !isNaN(parseFloat(minRating))) query.rating = { $gte: parseFloat(minRating) };

        const places = await Place.find(query).lean();

        const placesWithDistance = places
            .filter(place => getCoords(place) !== null)
            .map(place => {
                const { lat: pLat, lng: pLng } = getCoords(place);
                const distance = calculateDistance(userLat, userLng, pLat, pLng);
                return { ...place, distance: distance * 1000, distanceKm: parseFloat(distance.toFixed(2)) };
            })
            .filter(place => place.distanceKm <= maxRadiusKm);

        if (sort === 'rating') placesWithDistance.sort((a, b) => b.rating - a.rating);
        else if (sort === 'popularity') placesWithDistance.sort((a, b) => b.popularity - a.popularity);
        else placesWithDistance.sort((a, b) => a.distance - b.distance);

        res.json({ success: true, count: placesWithDistance.length, data: placesWithDistance });
    } catch (error) {
        console.error('getNearbyPlaces error:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching nearby places', error: error.message });
    }
};

// @route GET /api/places/feed
exports.getSmartFeed = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Please provide lat and lng' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({ success: false, message: 'Invalid lat/lng values' });
        }

        const allPlaces = await Place.find({}).lean();

        const placesWithDistance = allPlaces
            .filter(place => getCoords(place) !== null)
            .map(place => {
                const { lat: pLat, lng: pLng } = getCoords(place);
                const distance = calculateDistance(userLat, userLng, pLat, pLng);
                return { ...place, distanceKm: parseFloat(distance.toFixed(2)) };
            });

        const exploreNearby = [...placesWithDistance]
            .filter(p => p.distanceKm <= 50)
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 20);

        const trending = [...placesWithDistance]
            .filter(p => p.isTrending)
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0) || (b.rating || 0) - (a.rating || 0))
            .slice(0, 10);

        // Fallback: if no trending, return top rated
        const trendingResult = trending.length > 0
            ? trending
            : [...placesWithDistance].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);

        const recommended = [...placesWithDistance]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 15);

        res.json({
            success: true,
            data: { exploreNearby, trending: trendingResult, recommended }
        });
    } catch (error) {
        console.error('getSmartFeed error:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching smart feed', error: error.message });
    }
};

// @route GET /api/places/:id
exports.getPlace = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
        res.json({ success: true, data: place });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid place ID format' });
        }
        res.status(500).json({ success: false, message: 'Error fetching place', error: error.message });
    }
};

// @route GET /api/places
exports.getAllPlaces = async (req, res) => {
    try {
        const { category, sort = 'rating', page = 1, limit = 20, minRating, search } = req.query;

        let query = {};
        if (category && category !== 'all') query.category = category;
        if (minRating && !isNaN(parseFloat(minRating))) query.rating = { $gte: parseFloat(minRating) };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOption = sort === 'popularity' ? { popularity: -1 } : sort === 'rating' ? { rating: -1 } : { createdAt: -1 };
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

        const [places, total] = await Promise.all([
            Place.find(query).sort(sortOption).limit(limitNum).skip((pageNum - 1) * limitNum).lean(),
            Place.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: places.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: places
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching places', error: error.message });
    }
};

// @route POST /api/places
exports.createPlace = async (req, res) => {
    try {
        const place = await Place.create(req.body);
        res.status(201).json({ success: true, data: place });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error creating place', error: error.message });
    }
};

// @route PUT /api/places/:id
exports.updatePlace = async (req, res) => {
    try {
        const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
        res.json({ success: true, data: place });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid place ID' });
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error updating place', error: error.message });
    }
};

// @route DELETE /api/places/:id
exports.deletePlace = async (req, res) => {
    try {
        const place = await Place.findByIdAndDelete(req.params.id);
        if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
        res.json({ success: true, message: 'Place deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid place ID' });
        res.status(500).json({ success: false, message: 'Error deleting place', error: error.message });
    }
};

// @route GET /api/places/:id/nearby
exports.getNearbyAttractions = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ success: false, message: 'Place not found' });

        const coords = getCoords(place);
        if (!coords) return res.status(400).json({ success: false, message: 'Place has no valid location data' });

        const allPlaces = await Place.find({ _id: { $ne: place._id }, category: { $ne: 'hospital' } }).lean();

        const attractions = allPlaces
            .filter(p => getCoords(p) !== null)
            .map(p => {
                const { lat: pLat, lng: pLng } = getCoords(p);
                const distance = calculateDistance(coords.lat, coords.lng, pLat, pLng);
                return { ...p, distance: distance * 1000, distanceKm: parseFloat(distance.toFixed(2)) };
            })
            .filter(p => p.distanceKm <= 3)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10);

        res.json({ success: true, data: attractions });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid place ID' });
        res.status(500).json({ success: false, message: 'Error fetching nearby attractions', error: error.message });
    }
};

// @route GET /api/places/categories
exports.getCategories = (req, res) => {
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
    res.json({ success: true, data: categories });
};