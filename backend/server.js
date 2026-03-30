const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: (origin, callback) => {
        // Allow: no origin (curl/Postman), localhost, any vercel.app subdomain
        if (!origin) return callback(null, true);
        if (
            origin.startsWith('http://localhost') ||
            origin.endsWith('.vercel.app') ||
            origin === process.env.FRONTEND_URL
        ) {
            return callback(null, true);
        }
        // In production be permissive — CORS errors are worse than open access
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── BODY PARSERS ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
const authRoutes       = require('./routes/auth');
const placeRoutes      = require('./routes/places');
const hotelRoutes      = require('./routes/hotels');
const restaurantRoutes = require('./routes/restaurants');
const emergencyRoutes  = require('./routes/emergency');
const transportRoutes  = require('./routes/transport');
const aiRoutes         = require('./routes/ai');
const adminRoutes      = require('./routes/admin');
const weatherRoutes    = require('./routes/weather');
const geocodingRoutes  = require('./routes/geocoding');

app.use('/api/auth',        authRoutes);
app.use('/api/places',      placeRoutes);
app.use('/api/hotels',      hotelRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/emergency',   emergencyRoutes);
app.use('/api/transport',   transportRoutes);
app.use('/api/ai',          aiRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/weather',     weatherRoutes);
app.use('/api/geocode',     geocodingRoutes);
app.use('/api/routing',     geocodingRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: 'OK',
        database: dbStates[mongoose.connection.readyState] || 'unknown',
        mongoUri: process.env.MONGO_URI ? '✅ set' : '❌ NOT SET — add to Render env vars',
        timestamp: new Date().toISOString()
    });
});

// Root
app.get('/', (req, res) => {
    res.json({ message: 'TravelMate API running ✅' });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Start listening FIRST — so Render health check passes immediately
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);

    // Connect MongoDB after port is bound
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('❌ MONGO_URI is not set! Go to Render → Environment and add MONGO_URI');
        console.error('   Get it from: MongoDB Atlas → Connect → Drivers');
        // Server stays running so health check works, but DB routes will fail
        return;
    }

    mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
    })
    .then(async () => {
        console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
        try {
            const Place      = require('./models/Place');
            const Hotel      = require('./models/Hotel');
            const Restaurant = require('./models/Restaurant');
            await Promise.all([Place.createIndexes(), Hotel.createIndexes(), Restaurant.createIndexes()]);
            console.log('✅ Indexes ready');
        } catch (e) {
            console.warn('⚠️  Index warning (non-fatal):', e.message);
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        // Do NOT exit — keep server alive so we can diagnose via /api/health
    });
});

module.exports = app;