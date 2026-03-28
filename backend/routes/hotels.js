const express = require('express');
const router = express.Router();
const {
    getNearbyHotels,
    getAllHotels,
    getHotel,
    createHotel,
    updateHotel,
    deleteHotel
} = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/auth');

router.get('/nearby', getNearbyHotels);
router.get('/:id', getHotel);
router.get('/', getAllHotels);

// Admin routes
router.post('/', protect, authorize('admin'), createHotel);
router.put('/:id', protect, authorize('admin'), updateHotel);
router.delete('/:id', protect, authorize('admin'), deleteHotel);

module.exports = router;