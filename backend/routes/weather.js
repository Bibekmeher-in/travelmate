const express = require('express');
const router = express.Router();

// Mock weather data for Bhubaneswar (in production, use OpenWeatherMap API)
router.get('/', async (req, res) => {
    try {
        const { lat, lng } = req.query;

        // Default to Bhubaneswar coordinates
        const latitude = lat || 20.2961;
        const longitude = lng || 85.8245;

        // Mock weather data
        const weather = {
            location: 'Bhubaneswar',
            temperature: 28,
            feelsLike: 30,
            humidity: 65,
            windSpeed: 12,
            condition: 'Partly Cloudy',
            icon: '⛅',
            forecast: [
                { day: 'Today', high: 32, low: 24, condition: 'Partly Cloudy' },
                { day: 'Tomorrow', high: 33, low: 25, condition: 'Sunny' },
                { day: 'Day 3', high: 31, low: 23, condition: 'Rain' }
            ],
            bestTimeToVisit: 'October to March',
            currentSeason: 'Winter (Best Time)'
        };

        res.json({
            success: true,
            data: weather
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching weather',
            error: error.message
        });
    }
});

module.exports = router;