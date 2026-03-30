const express = require('express');
const router = express.Router();
const {
    planTrip,
    calculateBudget,
    getRecommendations,
    saveTrip,
    getMyTrips,
    chatWithAI
} = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/auth');

// Trip planner — public (no auth required to generate a plan)
router.post('/trip-planner', optionalAuth, planTrip);
// Budget calc — fully public
router.post('/budget-calculator', calculateBudget);
// Recommendations — fully public
router.get('/recommendations', getRecommendations);
// Save trip — requires login
router.post('/save-trip', protect, saveTrip);
// Get my trips — requires login
router.get('/my-trips', protect, getMyTrips);
// Chat — fully public
router.post('/chat', chatWithAI);

module.exports = router;