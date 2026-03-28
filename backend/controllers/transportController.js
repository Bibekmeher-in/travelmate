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

// Calculate fare based on distance and base rate
const calculateFare = (distance, baseRate, perKmRate, minFare) => {
    const calculatedFare = baseRate + (distance * perKmRate);
    return Math.max(calculatedFare, minFare);
};

// @desc    Estimate transport fares
// @route   GET /api/transport/fare
// @access  Public
exports.estimateFare = async (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng } = req.query;

        if (!fromLat || !fromLng || !toLat || !toLng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both origin and destination coordinates'
            });
        }

        const distance = calculateDistance(
            parseFloat(fromLat),
            parseFloat(fromLng),
            parseFloat(toLat),
            parseFloat(toLng)
        );

        // Transport options with fare calculation
        const transportOptions = [
            {
                name: 'Ola',
                type: 'cab',
                icon: '🚗',
                baseFare: 50,
                perKm: 15,
                minFare: 100,
                estimatedFare: calculateFare(distance, 50, 15, 100),
                bookingUrl: 'https://olaic.in',
                description: 'Available 24/7, multiple cab options'
            },
            {
                name: 'Uber',
                type: 'cab',
                icon: '🚙',
                baseFare: 45,
                perKm: 14,
                minFare: 90,
                estimatedFare: calculateFare(distance, 45, 14, 90),
                bookingUrl: 'https://uber.com',
                description: 'Premium rides, reliable service'
            },
            {
                name: 'Rapido',
                type: 'bike',
                icon: '🛵',
                baseFare: 20,
                perKm: 8,
                minFare: 40,
                estimatedFare: calculateFare(distance, 20, 8, 40),
                bookingUrl: 'https://rapido.bike',
                description: 'Affordable bike rides'
            },
            {
                name: 'Odisha Yatri',
                type: 'bus',
                icon: '🚌',
                baseFare: 10,
                perKm: 3,
                minFare: 20,
                estimatedFare: calculateFare(distance, 10, 3, 20),
                bookingUrl: 'https://odishayatri.gov.in',
                description: 'State-run bus service'
            },
            {
                name: 'AMA Bus',
                type: 'bus',
                icon: '🚌',
                baseFare: 15,
                perKm: 4,
                minFare: 25,
                estimatedFare: calculateFare(distance, 15, 4, 25),
                bookingUrl: 'https://amabus.in',
                description: 'City bus service in Bhubaneswar'
            },
            {
                name: 'Auto Rickshaw',
                type: 'auto',
                icon: '🛺',
                baseFare: 30,
                perKm: 12,
                minFare: 50,
                estimatedFare: calculateFare(distance, 30, 12, 50),
                bookingUrl: null,
                description: 'Available on demand'
            }
        ];

        res.json({
            success: true,
            data: {
                distance: distance.toFixed(2),
                distanceKm: distance.toFixed(2),
                transportOptions: transportOptions.map(t => ({
                    ...t,
                    estimatedFare: Math.round(t.estimatedFare)
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error estimating fare',
            error: error.message
        });
    }
};

// @desc    Get transport options from user location to destination
// @route   GET /api/transport/from-user
// @access  Public
exports.getTransportFromUser = async (req, res) => {
    try {
        const { userLat, userLng, destLat, destLng, destName } = req.query;

        if (!userLat || !userLng || !destLat || !destLng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required coordinates'
            });
        }

        const distance = calculateDistance(
            parseFloat(userLat),
            parseFloat(userLng),
            parseFloat(destLat),
            parseFloat(destLng)
        );

        const transportOptions = [
            {
                name: 'Ola',
                type: 'cab',
                icon: '🚗',
                estimatedFare: Math.round(calculateFare(distance, 50, 15, 100)),
                eta: Math.round(distance / 30 * 60), // Assuming 30 km/h avg speed
                bookingUrl: `https://olaic.in/book?pickup=${userLat},${userLng}&drop=${destLat},${destLng}`
            },
            {
                name: 'Uber',
                type: 'cab',
                icon: '🚙',
                estimatedFare: Math.round(calculateFare(distance, 45, 14, 90)),
                eta: Math.round(distance / 30 * 60),
                bookingUrl: `https://m.uber.com/ul/?pickup=${userLat},${userLng}&dropoff=${destLat},${destLng}`
            },
            {
                name: 'Rapido',
                type: 'bike',
                icon: '🛵',
                estimatedFare: Math.round(calculateFare(distance, 20, 8, 40)),
                eta: Math.round(distance / 25 * 60), // Bike faster
                bookingUrl: `https://rapido.bike/book?pickup=${userLat},${userLng}&drop=${destLat},${destLng}`
            }
        ];

        res.json({
            success: true,
            data: {
                destination: destName || 'Destination',
                distance: distance.toFixed(2),
                transportOptions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting transport options',
            error: error.message
        });
    }
};

// @desc    Get shortest path using Dijkstra-like approach (simplified)
// @route   GET /api/transport/route
// @access  Public
exports.getRoute = async (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng, waypoints } = req.query;

        if (!fromLat || !fromLng || !toLat || !toLng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide start and end coordinates'
            });
        }

        const directDistance = calculateDistance(
            parseFloat(fromLat),
            parseFloat(fromLng),
            parseFloat(toLat),
            parseFloat(toLng)
        );

        // Parse waypoints if provided
        let route = [];
        if (waypoints) {
            const points = waypoints.split('|');
            for (const point of points) {
                const [lat, lng] = point.split(',').map(Number);
                route.push({ lat, lng });
            }
        }

        // Calculate total route distance
        let totalDistance = directDistance;
        if (route.length > 0) {
            totalDistance = 0;
            let prevLat = parseFloat(fromLat);
            let prevLng = parseFloat(fromLng);

            for (const point of route) {
                totalDistance += calculateDistance(prevLat, prevLng, point.lat, point.lng);
                prevLat = point.lat;
                prevLng = point.lng;
            }
            totalDistance += calculateDistance(prevLat, prevLng, parseFloat(toLat), parseFloat(toLng));
        }

        // Estimate time (assuming avg 30 km/h in city)
        const estimatedTime = Math.round((totalDistance / 30) * 60); // in minutes

        res.json({
            success: true,
            data: {
                distance: totalDistance.toFixed(2),
                estimatedTime: estimatedTime,
                route: route,
                polyline: null // Would integrate with OSRM for actual route
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating route',
            error: error.message
        });
    }
};