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

// @desc    Get emergency services (hospitals, medical stores, police)
// @route   GET /api/emergency/nearby
// @access  Public
exports.getEmergencyServices = async (req, res) => {
    try {
        const { lat, lng, radius = 10000, type } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude and longitude'
            });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const maxRadiusKm = parseInt(radius) / 1000;

        let categories = [];
        if (type === 'hospital') {
            categories = ['hospital'];
        } else if (type === 'medical_store') {
            categories = ['medical_store'];
        } else if (type === 'police') {
            categories = ['police'];
        } else {
            categories = ['hospital', 'medical_store', 'police'];
        }

        // Get all places with matching categories
        const places = await Place.find({ category: { $in: categories } }).lean();

        // Calculate distances and filter by radius
        const services = places
            .map(place => {
                const placeLat = place.location.coordinates[1];
                const placeLng = place.location.coordinates[0];
                const distance = calculateDistance(userLat, userLng, placeLat, placeLng);
                return {
                    ...place,
                    distance: distance * 1000,
                    distanceKm: parseFloat(distance.toFixed(2))
                };
            })
            .filter(place => place.distanceKm <= maxRadiusKm)
            .sort((a, b) => a.distance - b.distance);

        // Group by category
        const grouped = {
            hospitals: services.filter(s => s.category === 'hospital'),
            medicalStores: services.filter(s => s.category === 'medical_store'),
            policeStations: services.filter(s => s.category === 'police')
        };

        res.json({
            success: true,
            data: grouped
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching emergency services',
            error: error.message
        });
    }
};

// @desc    Get emergency numbers
// @route   GET /api/emergency/numbers
// @access  Public
exports.getEmergencyNumbers = async (req, res) => {
    const emergencyNumbers = [
        { service: 'Police', number: '100', icon: '👮' },
        { service: 'Ambulance', number: '102', icon: '🚑' },
        { service: 'Fire Brigade', number: '101', icon: '🚒' },
        { service: 'Women Helpline', number: '1091', icon: '👩' },
        { service: 'Child Helpline', number: '1098', icon: '👶' },
        { service: 'Tourist Police', number: '1363', icon: '🎒' },
        { service: 'Odisha Emergency', number: '1070', icon: '🆘' },
        { service: 'NHAI Highway', number: '1033', icon: '🛣️' }
    ];

    res.json({
        success: true,
        data: emergencyNumbers
    });
};