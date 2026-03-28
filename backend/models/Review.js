const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    images: [String],
    isVerified: {
        type: Boolean,
        default: false
    },
    helpful: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

reviewSchema.index({ place: 1, createdAt: -1 });
reviewSchema.index({ hotel: 1, createdAt: -1 });
reviewSchema.index({ restaurant: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);