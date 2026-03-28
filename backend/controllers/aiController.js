const Place = require('../models/Place');
const Hotel = require('../models/Hotel');
const Restaurant = require('../models/Restaurant');
const Trip = require('../models/Trip');
const User = require('../models/User');

// Calculate distance helper
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// @desc    AI Trip Planner - Generate itinerary
// @route   POST /api/ai/trip-planner
// @access  Private
exports.planTrip = async (req, res) => {
    try {
        const {
            budget,
            days,
            interests,
            startDate,
            endDate,
            travelers = 1,
            lat,
            lng
        } = req.body;

        // Get user location or use default Bhubaneswar coordinates
        const userLat = lat || 20.2961;
        const userLng = lng || 85.8245;

        // Determine categories based on interests
        const interestCategories = {
            'temples': ['temple', 'historical'],
            'nature': ['park', 'tourist_place'],
            'shopping': ['mall', 'shopping'],
            'history': ['museum', 'historical'],
            'food': ['restaurant', 'cafe'],
            'culture': ['temple', 'museum', 'historical']
        };

        let selectedCategories = [];
        if (interests && interests.length > 0) {
            interests.forEach(interest => {
                if (interestCategories[interest]) {
                    selectedCategories.push(...interestCategories[interest]);
                }
            });
        }

        // If no interests specified, include all
        if (selectedCategories.length === 0) {
            selectedCategories = ['temple', 'tourist_place', 'park', 'museum', 'historical', 'shopping'];
        }

        // Get places based on categories
        const places = await Place.find({
            category: { $in: selectedCategories }
        }).sort({ rating: -1, popularity: -1 }).limit(50).lean();

        // Add distance to each place
        const placesWithDistance = places.map(place => ({
            ...place,
            distanceKm: calculateDistance(
                userLat, userLng,
                place.location.coordinates[1], place.location.coordinates[0]
            ).toFixed(2)
        }));

        // Sort by rating + popularity score
        placesWithDistance.sort((a, b) =>
            (b.rating + b.popularity / 100) - (a.rating + a.popularity / 100)
        );

        // Generate daily itinerary
        const itinerary = [];
        const placesPerDay = Math.ceil(placesWithDistance.length / days);

        for (let day = 1; day <= days; day++) {
            const start = (day - 1) * placesPerDay;
            const end = Math.min(start + placesPerDay, placesWithDistance.length);
            const dayPlaces = placesWithDistance.slice(start, end);

            const activities = dayPlaces.map((place, index) => ({
                time: `${9 + index * 2}:00`,
                place: place._id,
                placeName: place.name,
                activity: `Visit ${place.name}`,
                duration: place.estimatedVisitTime || '1-2 hours',
                notes: place.tips?.[0] || `Explore ${place.category}`
            }));

            // Add lunch and dinner recommendations
            activities.push({
                time: '12:00',
                place: null,
                placeName: 'Local Restaurant',
                activity: 'Lunch break',
                duration: '1 hour',
                notes: 'Try local Odisha cuisine'
            });

            activities.push({
                time: '19:00',
                place: null,
                placeName: 'Hotel/Accommodation',
                activity: 'Return to hotel',
                duration: '30 mins',
                notes: 'Rest for the next day'
            });

            itinerary.push({
                day,
                date: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + day - 1)),
                activities: activities.sort((a, b) => a.time.localeCompare(b.time))
            });
        }

        // Calculate budget
        const budgetOptions = {
            low: { hotelPerDay: 800, foodPerDay: 400, transportPerDay: 200 },
            medium: { hotelPerDay: 2000, foodPerDay: 800, transportPerDay: 400 },
            high: { hotelPerDay: 5000, foodPerDay: 2000, transportPerDay: 1000 }
        };

        const budgetSettings = budgetOptions[budget] || budgetOptions.medium;
        const totalBudget = {
            hotel: budgetSettings.hotelPerDay * days * travelers,
            food: budgetSettings.foodPerDay * days * travelers,
            transport: budgetSettings.transportPerDay * days,
            entry: 500 * days * travelers,
            misc: 1000,
            total: (budgetSettings.hotelPerDay * days * travelers) +
                (budgetSettings.foodPerDay * days * travelers) +
                (budgetSettings.transportPerDay * days) +
                (500 * days * travelers) + 1000
        };

        res.json({
            success: true,
            data: {
                itinerary,
                budget: totalBudget,
                recommendedHotels: await Hotel.find({})
                    .sort({ rating: -1 })
                    .limit(5)
                    .lean(),
                summary: {
                    totalPlaces: placesWithDistance.length,
                    days,
                    budget,
                    interests: interests || ['General']
                }
            }
        });
    } catch (error) {
        console.error('Trip planner error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating trip plan',
            error: error.message
        });
    }
};

// @desc    Budget Calculator
// @route   POST /api/ai/budget-calculator
// @access  Public
exports.calculateBudget = async (req, res) => {
    try {
        const {
            days,
            travelers = 1,
            hotelCategory,
            foodStyle,
            transportMode
        } = req.body;

        // Hotel costs
        const hotelCosts = {
            budget: 800,
            standard: 2000,
            luxury: 5000
        };

        // Food costs per day
        const foodCosts = {
            budget: 300,
            standard: 800,
            luxury: 2000
        };

        // Transport costs per day
        const transportCosts = {
            public: 100,
            cab: 500,
            private: 1500
        };

        const hotelPerDay = hotelCosts[hotelCategory] || hotelCosts.standard;
        const foodPerDay = foodCosts[foodStyle] || foodCosts.standard;
        const transportPerDay = transportCosts[transportMode] || transportCosts.cab;

        const total = {
            hotel: hotelPerDay * days * travelers,
            food: foodPerDay * days * travelers,
            transport: transportPerDay * days,
            entryFees: 500 * days * travelers,
            misc: 1000,
            total: (hotelPerDay * days * travelers) +
                (foodPerDay * days * travelers) +
                (transportPerDay * days) +
                (500 * days * travelers) + 1000,
            perPerson: ((hotelPerDay * days * travelers) +
                (foodPerDay * days * travelers) +
                (transportPerDay * days) +
                (500 * days * travelers) + 1000) / travelers
        };

        res.json({
            success: true,
            data: {
                breakdown: {
                    accommodation: {
                        perDay: hotelPerDay,
                        total: hotelPerDay * days * travelers,
                        description: `${hotelCategory} category hotel`
                    },
                    food: {
                        perDay: foodPerDay,
                        total: foodPerDay * days * travelers,
                        description: `${foodStyle} dining`
                    },
                    transport: {
                        perDay: transportPerDay,
                        total: transportPerDay * days,
                        description: `${transportMode} transport`
                    },
                    entryFees: {
                        perDay: 500,
                        total: 500 * days * travelers,
                        description: 'Temple and attraction entries'
                    },
                    miscellaneous: {
                        total: 1000,
                        description: 'Shopping, tips,应急'
                    }
                },
                totals: total,
                currency: 'INR'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating budget',
            error: error.message
        });
    }
};

// @desc    Get AI Recommendations
// @route   GET /api/ai/recommendations
// @access  Public
exports.getRecommendations = async (req, res) => {
    try {
        const { lat, lng, categories, limit = 10 } = req.query;

        const userLat = lat ? parseFloat(lat) : 20.2961;
        const userLng = lng ? parseFloat(lng) : 85.8245;

        let query = {};
        if (categories) {
            query.category = { $in: categories.split(',') };
        }

        // Get places and calculate score based on rating, distance, and popularity
        const places = await Place.find(query)
            .sort({ rating: -1, popularity: -1 })
            .limit(parseInt(limit) * 2)
            .lean();

        // Calculate recommendation score
        const scoredPlaces = places.map(place => {
            const distance = calculateDistance(
                userLat, userLng,
                place.location.coordinates[1], place.location.coordinates[0]
            );

            // Score: rating (40%) + popularity (30%) + proximity (30%)
            const score = (
                (place.rating / 5) * 0.4 +
                (place.popularity / 1000) * 0.3 +
                Math.max(0, (10 - distance) / 10) * 0.3
            ) * 100;

            return {
                ...place,
                distanceKm: distance.toFixed(2),
                recommendationScore: Math.round(score)
            };
        });

        // Sort by score and return top recommendations
        const recommendations = scoredPlaces
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: {
                recommendations,
                basedOn: {
                    location: { lat: userLat, lng: userLng },
                    categories: categories || 'all',
                    criteria: 'rating + popularity + proximity'
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting recommendations',
            error: error.message
        });
    }
};

// @desc    Save trip plan
// @route   POST /api/ai/save-trip
// @access  Private
exports.saveTrip = async (req, res) => {
    try {
        const trip = await Trip.create({
            ...req.body,
            user: req.user.id,
            isAIgenerated: true
        });

        res.status(201).json({
            success: true,
            data: trip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving trip',
            error: error.message
        });
    }
};

// @desc    Get user's trips
// @route   GET /api/ai/my-trips
// @access  Private
exports.getMyTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('itinerary.activities.place');

        res.json({
            success: true,
            data: trips
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trips',
            error: error.message
        });
    }
};

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Public
exports.chatWithAI = async (req, res) => {
    try {
        const { message, context } = req.body;

        // Simple rule-based responses (can be enhanced with LLM integration)
        const responses = {
            'hotel': 'Looking for hotels in Bhubaneswar? I can help you find accommodations based on your budget and preferences. Check out our Hotels section!',
            'restaurant': 'Bhubaneswar has amazing food options! From local Odia cuisine to international dining, we have it all. Visit the Restaurants section.',
            'temple': 'Bhubaneswar is known as the Temple City! Some famous temples include Lingaraj Temple, Mukteshwar, and Rajarani Temple.',
            'nearby': "I can show you places nearby! Please enable location access to see what's around you.",
            'trip': 'I can help you plan a trip! Tell me your budget, number of days, and interests.',
            'default': 'I\'m your travel assistant for Bhubaneswar. Ask me about places, hotels, restaurants, or help planning your trip!'
        };

        const lowerMessage = message.toLowerCase();
        let response = responses.default;

        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                response = value;
                break;
            }
        }

        res.json({
            success: true,
            data: {
                response,
                suggestions: ['Show nearby hotels', 'Find restaurants', 'Plan my trip', 'Show temples']
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error in chat',
            error: error.message
        });
    }
};