const Place = require('../models/Place');

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

const EMERGENCY_CATEGORIES = ['hospital', 'medical_store', 'police'];

// @route GET /api/emergency/nearby
exports.getEmergencyServices = async (req, res) => {
    try {
        const { lat, lng, radius = 50000, type } = req.query;

        if (!lat || !lng) return res.status(400).json({ success: false, message: 'Please provide lat and lng' });

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        if (isNaN(userLat) || isNaN(userLng)) return res.status(400).json({ success: false, message: 'Invalid lat/lng values' });

        const maxRadiusKm = parseFloat(radius) / 1000;

        let categories;
        if (type && EMERGENCY_CATEGORIES.includes(type)) {
            categories = [type];
        } else {
            categories = EMERGENCY_CATEGORIES;
        }

        const places = await Place.find({ category: { $in: categories } }).lean();

        const services = places
            .filter(p => safeCoords(p) !== null)
            .map(place => {
                const { lat: pLat, lng: pLng } = safeCoords(place);
                const distance = calculateDistance(userLat, userLng, pLat, pLng);
                return { ...place, distance: distance * 1000, distanceKm: parseFloat(distance.toFixed(2)) };
            })
            .filter(s => s.distanceKm <= maxRadiusKm)
            .sort((a, b) => a.distance - b.distance);

        const grouped = {
            hospitals:     services.filter(s => s.category === 'hospital'),
            medicalStores: services.filter(s => s.category === 'medical_store'),
            policeStations: services.filter(s => s.category === 'police')
        };

        res.json({ success: true, data: grouped });
    } catch (error) {
        console.error('getEmergencyServices error:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching emergency services', error: error.message });
    }
};

// @route GET /api/emergency/numbers
exports.getEmergencyNumbers = (req, res) => {
    const emergencyNumbers = [
        { service: 'Police',          number: '100',  icon: '👮' },
        { service: 'Ambulance',       number: '102',  icon: '🚑' },
        { service: 'Fire Brigade',    number: '101',  icon: '🚒' },
        { service: 'Women Helpline',  number: '1091', icon: '👩' },
        { service: 'Child Helpline',  number: '1098', icon: '👶' },
        { service: 'Tourist Police',  number: '1363', icon: '🎒' },
        { service: 'Odisha Emergency', number: '1070', icon: '🆘' },
        { service: 'NHAI Highway',    number: '1033', icon: '🛣️' }
    ];
    res.json({ success: true, data: emergencyNumbers });
};