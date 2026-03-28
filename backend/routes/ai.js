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
const { protect } = require('../middleware/auth');

router.post('/trip-planner', protect, planTrip);
router.post('/budget-calculator', calculateBudget);
router.get('/recommendations', getRecommendations);
router.post('/save-trip', protect, saveTrip);
router.get('/my-trips', protect, getMyTrips);
router.post('/chat', chatWithAI);

module.exports = router;