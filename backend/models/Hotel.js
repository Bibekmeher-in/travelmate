const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide hotel name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: true,
        maxlength: [2000]
    },
    category: {
        type: String,
        enum: ['budget', 'standard', 'luxury', 'resort'],
        default: 'standard'
    },
    images: [{
        url: String,
        caption: String
    }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    price: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'INR'
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: String,
        city: String,
        state: String
    },
    amenities: [{
        name: String,
        icon: String
    }],
    roomTypes: [{
        name: String,
        price: Number,
        capacity: Number,
        amenities: [String]
    }],
    contact: {
        phone: String,
        email: String,
        website: String
    },
    checkInTime: String,
    checkOutTime: String,
    bookingUrl: String,
    isAvailable: {
        type: Boolean,
        default: true
    },
    distanceFromCityCenter: Number,
    popularity: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Geospatial index
hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ category: 1, price: 1 });
hotelSchema.index({ rating: -1 });

module.exports = mongoose.model('Hotel', hotelSchema);