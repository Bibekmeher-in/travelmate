const express = require('express');
const router = express.Router();
const {
    getNearbyRestaurants,
    getAllRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

router.get('/nearby', getNearbyRestaurants);
router.get('/:id', getRestaurant);
router.get('/', getAllRestaurants);

// Admin routes
router.post('/', protect, authorize('admin'), createRestaurant);
router.put('/:id', protect, authorize('admin'), updateRestaurant);
router.delete('/:id', protect, authorize('admin'), deleteRestaurant);

module.exports = router;