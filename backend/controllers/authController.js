const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, language } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            language: language || 'en',
            role: 'user'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'Please login with Google'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
    try {
        const { tokenId } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email: payload.email });

        if (!user) {
            // Create new user
            user = await User.create({
                name: payload.name,
                email: payload.email,
                googleId: payload.sub,
                avatar: payload.picture,
                role: 'user'
            });
        } else if (!user.googleId) {
            // Link Google account to existing user
            user.googleId = payload.sub;
            user.avatar = user.avatar || payload.picture;
            await user.save();
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Error with Google authentication',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting user',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, language, preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, language, preferences },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// @desc    Add to favorites
// @route   POST /api/auth/favorites/:placeId
// @access  Private
exports.addFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.favorites.includes(req.params.placeId)) {
            return res.status(400).json({
                success: false,
                message: 'Place already in favorites'
            });
        }

        user.favorites.push(req.params.placeId);
        await user.save();

        res.json({
            success: true,
            message: 'Added to favorites',
            favorites: user.favorites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding to favorites',
            error: error.message
        });
    }
};

// @desc    Remove from favorites
// @route   DELETE /api/auth/favorites/:placeId
// @access  Private
exports.removeFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.favorites = user.favorites.filter(
            id => id.toString() !== req.params.placeId
        );
        await user.save();

        res.json({
            success: true,
            message: 'Removed from favorites',
            favorites: user.favorites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing from favorites',
            error: error.message
        });
    }
};

// @desc    Update user location
// @route   PUT /api/auth/location
// @access  Private
exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                lastActive: Date.now()
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Location updated',
            location: user.location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
};