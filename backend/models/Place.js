const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a place name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [200]
    },
    category: {
        type: String,
        required: true,
        enum: ['temple', 'tourist_place', 'park', 'mall', 'hotel', 'restaurant', 'cafe', 'museum', 'historical', 'shopping', 'hospital', 'police', 'medical_store']
    },
    images: [{
        url: String,
        caption: String
    }],
    rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'Please provide coordinates']
        },
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    entryFee: {
        type: String,
        default: 'Free'
    },
    timing: {
        open: String,
        close: String,
        days: String
    },
    contact: {
        phone: String,
        email: String,
        website: String
    },
    amenities: [String],
    specialFeatures: [String],
    isTrending: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    popularity: {
        type: Number,
        default: 0
    },
    estimatedVisitTime: {
        type: String,
        default: '1-2 hours'
    },
    bestTimeToVisit: String,
    tips: [String],
    language: {
        en: { name: String, description: String },
        hi: { name: String, description: String },
        or: { name: String, description: String }
    }
}, {
    timestamps: true
});

// Create 2dsphere index for geospatial queries
placeSchema.index({ location: '2dsphere' });

// Index for better query performance
placeSchema.index({ category: 1, rating: -1 });
placeSchema.index({ isTrending: 1 });
placeSchema.index({ popularity: -1 });

// Virtual for distance calculation (will be set during queries)
placeSchema.virtual('distance').get(function () {
    return this._distance;
});

placeSchema.set('toJSON', { virtuals: true });
placeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Place', placeSchema);