const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Place = require('../models/Place');
const Hotel = require('../models/Hotel');
const Restaurant = require('../models/Restaurant');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const [userCount, placeCount, hotelCount, restaurantCount] = await Promise.all([
            User.countDocuments(),
            Place.countDocuments(),
            Hotel.countDocuments(),
            Restaurant.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                users: userCount,
                places: placeCount,
                hotels: hotelCount,
                restaurants: restaurantCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: error.message
        });
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'User deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// @desc    Bulk create places
// @route   POST /api/admin/places/bulk
// @access  Private/Admin
router.post('/places/bulk', protect, authorize('admin'), async (req, res) => {
    try {
        const places = await Place.insertMany(req.body);
        res.status(201).json({
            success: true,
            data: places
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating places',
            error: error.message
        });
    }
});

// @desc    Bulk create hotels
// @route   POST /api/admin/hotels/bulk
// @access  Private/Admin
router.post('/hotels/bulk', protect, authorize('admin'), async (req, res) => {
    try {
        const hotels = await Hotel.insertMany(req.body);
        res.status(201).json({
            success: true,
            data: hotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating hotels',
            error: error.message
        });
    }
});

// @desc    Bulk create restaurants
// @route   POST /api/admin/restaurants/bulk
// @access  Private/Admin
router.post('/restaurants/bulk', protect, authorize('admin'), async (req, res) => {
    try {
        const restaurants = await Restaurant.insertMany(req.body);
        res.status(201).json({
            success: true,
            data: restaurants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating restaurants',
            error: error.message
        });
    }
});

module.exports = router;