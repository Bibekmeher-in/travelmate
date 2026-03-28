const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide restaurant name'],
        trim: true,
        maxlength: [100]
    },
    description: {
        type: String,
        required: true,
        maxlength: [2000]
    },
    category: {
        type: String,
        enum: ['veg', 'non_veg', 'cafe', 'fine_dining', 'fast_food', 'local', 'multi_cuisine'],
        default: 'multi_cuisine'
    },
    cuisine: [String],
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
    priceRange: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
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
        city: String
    },
    timing: {
        open: String,
        close: String
    },
    amenities: [String],
    menu: [{
        category: String,
        items: [{
            name: String,
            price: Number,
            description: String,
            isVegetarian: Boolean
        }]
    }],
    contact: {
        phone: String,
        email: String,
        website: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    popularity: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Geospatial index
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ category: 1, rating: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);