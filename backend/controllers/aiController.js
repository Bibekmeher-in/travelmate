const Place = require('../models/Place');
const Hotel = require('../models/Hotel');
const Restaurant = require('../models/Restaurant');
const Trip = require('../models/Trip');

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

// @route POST /api/ai/trip-planner
exports.planTrip = async (req, res) => {
    try {
        const { budget, days, interests, startDate, travelers = 1, lat, lng } = req.body;

        if (!days || isNaN(days) || days < 1) {
            return res.status(400).json({ success: false, message: 'Please provide a valid number of days' });
        }

        const userLat = parseFloat(lat) || 20.2961;
        const userLng = parseFloat(lng) || 85.8245;
        const numDays = Math.min(parseInt(days), 30);
        const numTravelers = Math.max(1, parseInt(travelers));

        const interestCategories = {
            temples: ['temple', 'historical'],
            nature: ['park', 'tourist_place'],
            shopping: ['mall', 'shopping'],
            history: ['museum', 'historical'],
            food: ['restaurant', 'cafe'],
            culture: ['temple', 'museum', 'historical']
        };

        let selectedCategories = [];
        if (Array.isArray(interests) && interests.length > 0) {
            interests.forEach(interest => {
                const cats = interestCategories[interest];
                if (cats) selectedCategories.push(...cats);
            });
        }
        if (selectedCategories.length === 0) {
            selectedCategories = ['temple', 'tourist_place', 'park', 'museum', 'historical', 'shopping'];
        }
        selectedCategories = [...new Set(selectedCategories)];

        const places = await Place.find({ category: { $in: selectedCategories } })
            .sort({ rating: -1, popularity: -1 })
            .limit(50)
            .lean();

        const placesWithDistance = places
            .filter(p => safeCoords(p) !== null)
            .map(p => {
                const { lat: pLat, lng: pLng } = safeCoords(p);
                return {
                    ...p,
                    distanceKm: parseFloat(calculateDistance(userLat, userLng, pLat, pLng).toFixed(2))
                };
            })
            .sort((a, b) => ((b.rating || 0) + (b.popularity || 0) / 100) - ((a.rating || 0) + (a.popularity || 0) / 100));

        const maxPerDay = 4;
        const itinerary = [];
        const baseDate = startDate ? new Date(startDate) : new Date();

        for (let day = 1; day <= numDays; day++) {
            const start = (day - 1) * maxPerDay;
            const dayPlaces = placesWithDistance.slice(start, start + maxPerDay);

            const activities = dayPlaces.map((place, index) => ({
                time: `${9 + index * 2}:00`,
                place: place._id,
                placeName: place.name,
                activity: `Visit ${place.name}`,
                duration: place.estimatedVisitTime || '1-2 hours',
                notes: (place.tips && place.tips[0]) || `Explore ${place.category}`
            }));

            activities.push({ time: '13:00', place: null, placeName: 'Local Restaurant', activity: 'Lunch break', duration: '1 hour', notes: 'Try local Odisha cuisine' });
            activities.push({ time: '20:00', place: null, placeName: 'Hotel', activity: 'Return to hotel', duration: '30 mins', notes: 'Rest up for tomorrow' });

            const dayDate = new Date(baseDate);
            dayDate.setDate(baseDate.getDate() + day - 1);

            itinerary.push({
                day,
                date: dayDate,
                activities: activities.sort((a, b) => a.time.localeCompare(b.time))
            });
        }

        const budgetOptions = {
            low:    { hotelPerDay: 800,  foodPerDay: 400,  transportPerDay: 200 },
            medium: { hotelPerDay: 2000, foodPerDay: 800,  transportPerDay: 400 },
            high:   { hotelPerDay: 5000, foodPerDay: 2000, transportPerDay: 1000 }
        };
        const bs = budgetOptions[budget] || budgetOptions.medium;
        const totalBudget = {
            hotel:     bs.hotelPerDay * numDays * numTravelers,
            food:      bs.foodPerDay * numDays * numTravelers,
            transport: bs.transportPerDay * numDays,
            entry:     500 * numDays * numTravelers,
            misc:      1000,
            total:     (bs.hotelPerDay * numDays * numTravelers) + (bs.foodPerDay * numDays * numTravelers) + (bs.transportPerDay * numDays) + (500 * numDays * numTravelers) + 1000
        };

        const recommendedHotels = await Hotel.find({}).sort({ rating: -1 }).limit(5).lean();

        res.json({
            success: true,
            data: {
                itinerary,
                budget: totalBudget,
                recommendedHotels,
                summary: { totalPlaces: placesWithDistance.length, days: numDays, budget, interests: interests || ['General'] }
            }
        });
    } catch (error) {
        console.error('planTrip error:', error.message);
        res.status(500).json({ success: false, message: 'Error generating trip plan', error: error.message });
    }
};

// @route POST /api/ai/budget-calculator
exports.calculateBudget = async (req, res) => {
    try {
        const { days, travelers = 1, hotelCategory, foodStyle, transportMode } = req.body;

        if (!days || isNaN(days) || days < 1) {
            return res.status(400).json({ success: false, message: 'Please provide a valid number of days' });
        }

        const numDays = parseInt(days);
        const numTravelers = Math.max(1, parseInt(travelers));

        const hotelCosts    = { budget: 800, standard: 2000, luxury: 5000 };
        const foodCosts     = { budget: 300, standard: 800,  luxury: 2000 };
        const transportCosts = { public: 100, cab: 500, private: 1500 };

        const hotelPerDay     = hotelCosts[hotelCategory] || hotelCosts.standard;
        const foodPerDay      = foodCosts[foodStyle]      || foodCosts.standard;
        const transportPerDay = transportCosts[transportMode] || transportCosts.cab;

        const totals = {
            hotel:     hotelPerDay * numDays * numTravelers,
            food:      foodPerDay * numDays * numTravelers,
            transport: transportPerDay * numDays,
            entryFees: 500 * numDays * numTravelers,
            misc:      1000,
            total:     (hotelPerDay * numDays * numTravelers) + (foodPerDay * numDays * numTravelers) + (transportPerDay * numDays) + (500 * numDays * numTravelers) + 1000
        };
        totals.perPerson = Math.round(totals.total / numTravelers);

        res.json({
            success: true,
            data: {
                breakdown: {
                    accommodation: { perDay: hotelPerDay, total: hotelPerDay * numDays * numTravelers, description: `${hotelCategory || 'standard'} hotel` },
                    food:          { perDay: foodPerDay,  total: foodPerDay * numDays * numTravelers,  description: `${foodStyle || 'standard'} dining` },
                    transport:     { perDay: transportPerDay, total: transportPerDay * numDays,        description: `${transportMode || 'cab'} transport` },
                    entryFees:     { perDay: 500, total: 500 * numDays * numTravelers, description: 'Temple and attraction entries' },
                    miscellaneous: { total: 1000, description: 'Shopping, tips, emergency' }
                },
                totals,
                currency: 'INR'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error calculating budget', error: error.message });
    }
};

// @route GET /api/ai/recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const { lat, lng, categories, limit = 10 } = req.query;

        const userLat = lat ? parseFloat(lat) : 20.2961;
        const userLng = lng ? parseFloat(lng) : 85.8245;
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

        let query = {};
        if (categories) query.category = { $in: categories.split(',') };

        const places = await Place.find(query).sort({ rating: -1, popularity: -1 }).limit(limitNum * 2).lean();

        const recommendations = places
            .filter(p => safeCoords(p) !== null)
            .map(place => {
                const { lat: pLat, lng: pLng } = safeCoords(place);
                const distance = calculateDistance(userLat, userLng, pLat, pLng);
                const score = (
                    ((place.rating || 0) / 5) * 0.4 +
                    ((place.popularity || 0) / 1000) * 0.3 +
                    Math.max(0, (10 - distance) / 10) * 0.3
                ) * 100;
                return { ...place, distanceKm: parseFloat(distance.toFixed(2)), recommendationScore: Math.round(score) };
            })
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, limitNum);

        res.json({
            success: true,
            data: {
                recommendations,
                basedOn: { location: { lat: userLat, lng: userLng }, categories: categories || 'all', criteria: 'rating + popularity + proximity' }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error getting recommendations', error: error.message });
    }
};

// @route POST /api/ai/save-trip
exports.saveTrip = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

        const trip = await Trip.create({ ...req.body, user: req.user.id, isAIgenerated: true });
        res.status(201).json({ success: true, data: trip });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error saving trip', error: error.message });
    }
};

// @route GET /api/ai/my-trips
exports.getMyTrips = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

        const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: trips });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching trips', error: error.message });
    }
};

// @route POST /api/ai/chat
exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ success: false, message: 'Please provide a message' });
        }

        const responses = {
            hotel:      'Looking for hotels in Bhubaneswar? Check our Hotels section for accommodations based on your budget!',
            restaurant: 'Bhubaneswar has amazing food! From local Odia cuisine to international dining. Visit the Restaurants section.',
            temple:     'Bhubaneswar is the Temple City! Famous temples: Lingaraj, Mukteshwar, Rajarani, and Brahmeswara.',
            museum:     'Great museums to visit: Odisha State Museum, Tribal Museum, and the Regional Museum of Natural History.',
            park:       'Beautiful parks: Ekamra Kanan, Nandankanan Zoo, Buddha Jayanti Park.',
            nearby:     'I can show places nearby! Please enable location access in your browser.',
            trip:       'I can help you plan a trip! Use the AI Trip Planner — tell me your budget, days, and interests.',
            emergency:  'For emergencies: Police 100, Ambulance 102, Fire 101, Tourist Police 1363.',
            weather:    'Bhubaneswar is best visited October to March. Current season info is on your home screen.',
            default:    "I'm your TravelMate guide for Bhubaneswar! Ask me about temples, hotels, restaurants, trip planning, or emergency services."
        };

        const lowerMessage = message.toLowerCase();
        let response = responses.default;
        for (const [key, value] of Object.entries(responses)) {
            if (key !== 'default' && lowerMessage.includes(key)) { response = value; break; }
        }

        res.json({
            success: true,
            data: {
                response,
                suggestions: ['Show nearby hotels', 'Find restaurants', 'Plan my trip', 'Show temples', 'Emergency numbers']
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error in chat', error: error.message });
    }
};