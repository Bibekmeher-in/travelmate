const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    budget: {
        total: Number,
        breakdown: {
            hotel: Number,
            food: Number,
            transport: Number,
            entry: Number,
            misc: Number
        }
    },
    travelers: {
        count: Number,
        type: String
    },
    interests: [String],
    itinerary: [{
        day: Number,
        date: Date,
        activities: [{
            time: String,
            place: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Place'
            },
            activity: String,
            duration: String,
            notes: String
        }]
    }],
    status: {
        type: String,
        enum: ['planned', 'active', 'completed', 'cancelled'],
        default: 'planned'
    },
    isAIgenerated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

tripSchema.index({ user: 1, startDate: -1 });

module.exports = mongoose.model('Trip', tripSchema);