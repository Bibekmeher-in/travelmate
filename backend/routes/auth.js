const express = require('express');
const router = express.Router();
const {
    register,
    login,
    googleAuth,
    getMe,
    updateProfile,
    addFavorite,
    removeFavorite,
    updateLocation
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/favorites/:placeId', protect, addFavorite);
router.delete('/favorites/:placeId', protect, removeFavorite);
router.put('/location', protect, updateLocation);

module.exports = router;