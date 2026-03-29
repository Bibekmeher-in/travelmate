const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_tourism_bhubaneswar')
  .then(async () => {
    console.log('MongoDB connected successfully');

    // Create indexes - wrap in try-catch to handle disk space issues
    try {
      const Place = require('./models/Place');
      const Hotel = require('./models/Hotel');
      const Restaurant = require('./models/Restaurant');

      await Place.createIndexes();
      await Hotel.createIndexes();
      await Restaurant.createIndexes();

      console.log('MongoDB indexes created');
    } catch (indexError) {
      console.log('Index creation warning:', indexError.message);
      console.log('Continuing without explicit index creation...');
    }
  })
  .catch(err => console.log('MongoDB connection error:', err.message));

// Import Routes
const authRoutes = require('./routes/auth');
const placeRoutes = require('./routes/places');
const hotelRoutes = require('./routes/hotels');
const restaurantRoutes = require('./routes/restaurants');
const emergencyRoutes = require('./routes/emergency');
const transportRoutes = require('./routes/transport');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const weatherRoutes = require('./routes/weather');
const geocodingRoutes = require('./routes/geocoding');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/geocode', geocodingRoutes);
app.use('/api/routing', geocodingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TravelMate Bhubaneswar AI API is running' });
});

// Root route
app.get('/', (req, res) => {
  res.send('TravelMate Bhubaneswar API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;