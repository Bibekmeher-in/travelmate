const Hotel = require('../models/Hotel');

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

// @route GET /api/hotels/nearby
exports.getNearbyHotels = async (req, res) => {
    try {
        const { lat, lng, radius = 50000, minPrice, maxPrice, category } = req.query;

        if (!lat || !lng) return res.status(400).json({ success: false, message: 'Please provide lat and lng' });

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        if (isNaN(userLat) || isNaN(userLng)) return res.status(400).json({ success: false, message: 'Invalid lat/lng values' });

        const maxRadiusKm = parseFloat(radius) / 1000;
        let query = {};
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query['price.min'] = {};
            if (minPrice && !isNaN(minPrice)) query['price.min'].$gte = parseInt(minPrice);
            if (maxPrice && !isNaN(maxPrice)) query['price.max'] = { $lte: parseInt(maxPrice) };
        }

        const hotels = await Hotel.find(query).lean();

        const hotelsWithDistance = hotels
            .filter(h => safeCoords(h) !== null)
            .map(hotel => {
                const { lat: hLat, lng: hLng } = safeCoords(hotel);
                const distance = calculateDistance(userLat, userLng, hLat, hLng);
                return { ...hotel, distance: distance * 1000, distanceKm: parseFloat(distance.toFixed(2)) };
            })
            .filter(h => h.distanceKm <= maxRadiusKm)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0));

        res.json({ success: true, count: hotelsWithDistance.length, data: hotelsWithDistance });
    } catch (error) {
        console.error('getNearbyHotels error:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching hotels', error: error.message });
    }
};

// @route GET /api/hotels
exports.getAllHotels = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sort = 'rating', page = 1, limit = 20 } = req.query;

        let query = {};
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            if (minPrice && !isNaN(minPrice)) query['price.min'] = { $gte: parseInt(minPrice) };
            if (maxPrice && !isNaN(maxPrice)) query['price.max'] = { $lte: parseInt(maxPrice) };
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const sortOption = sort === 'price' ? { 'price.min': 1 } : { rating: -1 };

        const [hotels, total] = await Promise.all([
            Hotel.find(query).sort(sortOption).limit(limitNum).skip((pageNum - 1) * limitNum).lean(),
            Hotel.countDocuments(query)
        ]);

        res.json({ success: true, count: hotels.length, total, page: pageNum, pages: Math.ceil(total / limitNum), data: hotels });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching hotels', error: error.message });
    }
};

// @route GET /api/hotels/:id
exports.getHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        res.json({ success: true, data: hotel });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid hotel ID' });
        res.status(500).json({ success: false, message: 'Error fetching hotel', error: error.message });
    }
};

// @route POST /api/hotels
exports.createHotel = async (req, res) => {
    try {
        const hotel = await Hotel.create(req.body);
        res.status(201).json({ success: true, data: hotel });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error creating hotel', error: error.message });
    }
};

// @route PUT /api/hotels/:id
exports.updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        res.json({ success: true, data: hotel });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid hotel ID' });
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error updating hotel', error: error.message });
    }
};

// @route DELETE /api/hotels/:id
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        res.json({ success: true, message: 'Hotel deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid hotel ID' });
        res.status(500).json({ success: false, message: 'Error deleting hotel', error: error.message });
    }
};