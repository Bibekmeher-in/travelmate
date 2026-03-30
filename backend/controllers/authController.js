const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, language } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            phone: phone || '',
            language: language || 'en',
            role: 'user'
        });

        const token = generateToken(user._id);
        res.status(201).json({ success: true, token, user: user.getPublicProfile() });
    } catch (error) {
        console.error('Register error:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
    }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        if (!user.password) {
            return res.status(401).json({ success: false, message: 'Please login with Google' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        res.json({ success: true, token, user: user.getPublicProfile() });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
    }
};

// @route POST /api/auth/google
exports.googleAuth = async (req, res) => {
    try {
        const { tokenId } = req.body;
        if (!tokenId) {
            return res.status(400).json({ success: false, message: 'Google token is required' });
        }
        if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-client-id') {
            return res.status(503).json({ success: false, message: 'Google OAuth is not configured on this server' });
        }

        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();

        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = await User.create({
                name: payload.name,
                email: payload.email.toLowerCase(),
                googleId: payload.sub,
                avatar: payload.picture || '',
                role: 'user'
            });
        } else if (!user.googleId) {
            user.googleId = payload.sub;
            user.avatar = user.avatar || payload.picture || '';
            await user.save();
        }

        const token = generateToken(user._id);
        res.json({ success: true, token, user: user.getPublicProfile() });
    } catch (error) {
        console.error('Google auth error:', error.message);
        if (error.message.includes('Token used too late') || error.message.includes('Invalid token')) {
            return res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
        }
        res.status(500).json({ success: false, message: 'Error with Google authentication', error: error.message });
    }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: user.getPublicProfile() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error getting user', error: error.message });
    }
};

// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, language, preferences } = req.body;
        const allowedLanguages = ['en', 'hi', 'or'];

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone;
        if (language && allowedLanguages.includes(language)) updateData.language = language;
        if (preferences) updateData.preferences = preferences;

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: user.getPublicProfile() });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
    }
};

// @route POST /api/auth/favorites/:placeId
exports.addFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const placeId = req.params.placeId;
        if (user.favorites.map(f => f.toString()).includes(placeId)) {
            return res.status(400).json({ success: false, message: 'Place already in favorites' });
        }

        user.favorites.push(placeId);
        await user.save();
        res.json({ success: true, message: 'Added to favorites', favorites: user.favorites });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid place ID' });
        res.status(500).json({ success: false, message: 'Error adding to favorites', error: error.message });
    }
};

// @route DELETE /api/auth/favorites/:placeId
exports.removeFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.favorites = user.favorites.filter(id => id.toString() !== req.params.placeId);
        await user.save();
        res.json({ success: true, message: 'Removed from favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error removing from favorites', error: error.message });
    }
};

// @route PUT /api/auth/location
exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ success: false, message: 'Valid latitude and longitude are required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] }, lastActive: Date.now() },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'Location updated', location: user.location });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating location', error: error.message });
    }
};