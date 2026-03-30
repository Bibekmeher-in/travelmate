const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── BODY PARSERS ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── REQUEST LOGGER (production-safe) ────────────────────────────────────────
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`${req.method} ${req.path}`);
    }
    next();
});

// ─── MONGODB CONNECTION ───────────────────────────────────────────────────────
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not set. Please add it to your Render environment variables.');
        }

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // timeout after 10s
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

        // Create indexes safely
        try {
            const Place = require('./models/Place');
            const Hotel = require('./models/Hotel');
            const Restaurant = require('./models/Restaurant');
            await Promise.all([
                Place.createIndexes(),
                Hotel.createIndexes(),
                Restaurant.createIndexes()
            ]);
            console.log('✅ MongoDB indexes ready');
        } catch (indexErr) {
            console.warn('⚠️  Index creation warning (non-fatal):', indexErr.message);
        }
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        // Exit so Render auto-restarts the service
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

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

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
    res.json({
        status: 'OK',
        message: 'TravelMate API is running',
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'TravelMate Bhubaneswar API is running ✅' });
});

// ─── 404 HANDLER ────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('💥 Unhandled error:', err.stack || err.message);

    // Handle specific error types
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
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
        return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    }
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ success: false, message: 'CORS: origin not allowed' });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ─── START ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
});

// Handle uncaught exceptions (prevent silent crashes)
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;