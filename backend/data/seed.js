const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_tourism_bhubaneswar')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Place Schema
const placeSchema = new mongoose.Schema({
    name: String,
    description: String,
    shortDescription: String,
    category: String,
    images: Array,
    rating: Number,
    reviewCount: Number,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: Array,
        address: String,
        city: String,
        state: String
    },
    entryFee: String,
    timing: Object,
    contact: Object,
    amenities: Array,
    isTrending: Boolean,
    isFeatured: Boolean,
    popularity: Number,
    estimatedVisitTime: String
});

const Place = mongoose.model('Place', placeSchema);

// Bhubaneswar Seed Data
const seedPlaces = [
    // TEMPLES
    {
        name: 'Lingaraj Temple',
        description: 'One of the oldest and most sacred temples in Odisha, dedicated to Lord Shiva. The temple complex consists of many shrines and is known for its exquisite Kalinga architecture.',
        shortDescription: 'Ancient Shiva temple with stunning architecture',
        category: 'temple',
        rating: 4.8,
        reviewCount: 2500,
        location: {
            type: 'Point',
            coordinates: [85.8358, 20.2428],
            address: 'Lingaraj Temple Road, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '6:00 AM', close: '9:00 PM' },
        amenities: ['Parking', 'Prasad', 'Guide available'],
        isTrending: true,
        isFeatured: true,
        popularity: 1000,
        estimatedVisitTime: '1-2 hours',
        images: [{ url: '/images/temple.png' }]
    },
    {
        name: 'Mukteshwar Temple',
        description: 'Known as the "Gem of Odisha architecture", this 10th-century temple is famous for its exquisite stone carvings and the beautiful nat mandir (dance hall).',
        shortDescription: 'Architectural gem with intricate carvings',
        category: 'temple',
        rating: 4.7,
        reviewCount: 1800,
        location: {
            type: 'Point',
            coordinates: [85.8436, 20.2486],
            address: 'Mukteshwar Road, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '6:00 AM', close: '8:00 PM' },
        amenities: ['Photography allowed', 'Guides available'],
        isTrending: true,
        isFeatured: true,
        popularity: 900,
        estimatedVisitTime: '1 hour',
        images: [{ url: '/images/temple.png' }]
    },
    {
        name: 'Rajarani Temple',
        description: 'Famous for its elegant architecture and intricate stone carvings, this 11th-century temple is dedicated to Lord Shiva. The temple is known for its beautiful spire.',
        shortDescription: 'Elegant temple with beautiful spire',
        category: 'temple',
        rating: 4.6,
        reviewCount: 1200,
        location: {
            type: 'Point',
            coordinates: [85.8427, 20.2476],
            address: 'Rajarani Temple Road, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '6:00 AM', close: '7:00 PM' },
        amenities: ['Photography', 'Shopping nearby'],
        isTrending: false,
        isFeatured: true,
        popularity: 750,
        estimatedVisitTime: '45 mins',
        images: [{ url: '/images/temple.png' }]
    },
    {
        name: 'Khandagiri-Udayagiri Caves',
        description: 'Ancient Jain rock-cut caves dating back to 2nd century BCE. These caves provide insights into ancient Buddhist and Jain religious traditions.',
        shortDescription: 'Ancient Jain caves with historical significance',
        category: 'historical',
        rating: 4.4,
        reviewCount: 800,
        location: {
            type: 'Point',
            coordinates: [85.7833, 20.2500],
            address: 'Khandagiri Hills, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: '₹15 (Indian), ₹200 (Foreign)',
        timing: { open: '7:00 AM', close: '5:00 PM' },
        amenities: ['Guide available', 'Hiking'],
        isTrending: true,
        isFeatured: false,
        popularity: 600,
        estimatedVisitTime: '2-3 hours',
        images: [{ url: '/images/museum.png' }]
    },
    {
        name: 'Ananta Vasudeva Temple',
        description: 'A beautiful temple dedicated to Lord Vasudeva (Krishna), known for its excellent architectural design and serene atmosphere.',
        shortDescription: 'Dedicated to Lord Krishna',
        category: 'temple',
        rating: 4.3,
        reviewCount: 500,
        location: {
            type: 'Point',
            coordinates: [85.8200, 20.2600],
            address: 'Ananta Vasudeva Temple Road',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '6:00 AM', close: '8:00 PM' },
        amenities: ['Prasad'],
        isTrending: false,
        isFeatured: false,
        popularity: 400,
        estimatedVisitTime: '30 mins'
    },
    {
        name: 'Chausath Yogini Temple',
        description: 'An ancient 9th-century temple located at Hirapur, featuring 64 intricately carved stone idols of Yoginis arranged in a circular formation.',
        shortDescription: '9th-century tantric temple with 64 yoginis',
        category: 'historical',
        rating: 4.6,
        reviewCount: 950,
        location: {
            type: 'Point',
            coordinates: [85.8753, 20.2136],
            address: 'Hirapur, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '6:00 AM', close: '7:00 PM' },
        amenities: ['Guide available', 'Photography'],
        isTrending: true,
        isFeatured: true,
        popularity: 800,
        estimatedVisitTime: '1 hour',
        images: [{ url: '/images/temple.png' }]
    },
    {
        name: 'Bindu Sagar Lake',
        description: 'A serene and sacred lake situated close to the Lingaraj Temple. It is believed to contain water from all the holy rivers of India and is central to numerous local festivals.',
        shortDescription: 'Sacred lake surrounded by heritage temples',
        category: 'tourist_place',
        rating: 4.3,
        reviewCount: 1500,
        location: {
            type: 'Point',
            coordinates: [85.8378, 20.2444],
            address: 'Near Lingaraj Temple, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '24 hours', close: '24 hours' },
        amenities: ['Seating', 'Evening Aarti'],
        isTrending: true,
        isFeatured: true,
        popularity: 700,
        estimatedVisitTime: '30-45 mins',
        images: [{ url: '/images/park.png' }]
    },
    {
        name: 'Parasurameswara Temple',
        description: 'One of the oldest existing temples in Bhubaneswar, built in 650 CE. Known for its early Odishan temple architecture and ornate stone carvings depicting mythological tales.',
        shortDescription: 'Historically significant 7th-century temple',
        category: 'historical',
        rating: 4.5,
        reviewCount: 650,
        location: {
            type: 'Point',
            coordinates: [85.8415, 20.2467],
            address: 'Near Mukteswara Temple, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '6:00 AM', close: '8:00 PM' },
        amenities: ['Photography allowed'],
        isTrending: false,
        isFeatured: false,
        popularity: 550,
        estimatedVisitTime: '1 hour',
        images: [{ url: '/images/museum.png' }]
    },
    {
        name: 'Ram Mandir',
        description: 'A prominent and beautifully constructed temple located in the heart of the city, characterized by its towering spires visible from a distance.',
        shortDescription: 'Modern prominent temple structure',
        category: 'temple',
        rating: 4.7,
        reviewCount: 4200,
        location: {
            type: 'Point',
            coordinates: [85.8364, 20.2741],
            address: 'Janpath Road, Kharvela Nagar, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '6:00 AM', close: '9:00 PM' },
        amenities: ['Parking', 'Prasad', 'Drinking Water'],
        isTrending: true,
        isFeatured: true,
        popularity: 1200,
        estimatedVisitTime: '1 hour',
        images: [{ url: '/images/temple.png' }]
    },
    {
        name: 'ISKCON Temple',
        description: 'A renowned spiritual institution dedicated to Lord Krishna and Radharani, offering vegetarian dining options and a serene praying atmosphere.',
        shortDescription: 'Spiritual center with beautiful idols',
        category: 'temple',
        rating: 4.6,
        reviewCount: 2800,
        location: {
            type: 'Point',
            coordinates: [85.8272, 20.2778],
            address: 'IRC Village, Nayapalli, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '4:30 AM', close: '8:30 PM' },
        amenities: ['Prasad', 'Govinda Restaurant', 'Parking'],
        isTrending: false,
        isFeatured: true,
        popularity: 850,
        estimatedVisitTime: '1.5 hours',
        images: [{ url: '/images/temple.png' }]
    },

    // TOURIST PLACES
    {
        name: 'Nandankanan Zoological Park',
        description: 'One of the premier zoological parks in India, known for its natural setting and conservation efforts. Home to white tigers, lions, and various species of birds.',
        description: 'Premier zoological park with white tigers',
        category: 'tourist_place',
        rating: 4.5,
        reviewCount: 3000,
        location: {
            type: 'Point',
            coordinates: [85.8166, 20.3923],
            address: 'Nandankanan Road, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: '₹30 (Indian), ₹500 (Foreign)',
        timing: { open: '8:00 AM', close: '5:00 PM' },
        amenities: ['Boating', 'Restaurant', 'Parking', 'Toy Train'],
        isTrending: true,
        isFeatured: true,
        popularity: 950,
        estimatedVisitTime: '3-4 hours',
        images: [{ url: '/images/park.png' }]
    },
    {
        name: 'Odisha State Museum',
        description: 'A treasure trove of Odisha\'s rich cultural heritage with artifacts dating back to ancient times. Features sculptures, manuscripts, and tribal exhibits.',
        shortDescription: 'Museum showcasing Odisha\'s heritage',
        category: 'museum',
        rating: 4.3,
        reviewCount: 800,
        location: {
            type: 'Point',
            coordinates: [85.8352, 20.2638],
            address: 'Kalpana Area, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: '₹15',
        timing: { open: '10:00 AM', close: '5:00 PM' },
        amenities: ['Audio guide', 'Photography'],
        isTrending: false,
        isFeatured: true,
        popularity: 500,
        estimatedVisitTime: '2 hours',
        images: [{ url: '/images/museum.png' }]
    },
    {
        name: 'Ekamra Haat',
        description: 'A traditional handicraft emporium showcasing Odisha\'s rich art and craft. You can buy authentic Odisha handicrafts, textiles, and souvenirs.',
        shortDescription: 'Handicraft market with local artifacts',
        category: 'shopping',
        rating: 4.2,
        reviewCount: 1200,
        location: {
            type: 'Point',
            coordinates: [85.8200, 20.2800],
            address: 'Near Kalpana Square, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '10:00 AM', close: '8:00 PM' },
        amenities: ['Bargaining', 'Food court'],
        isTrending: true,
        isFeatured: false,
        popularity: 700,
        estimatedVisitTime: '1-2 hours'
    },
    {
        name: 'Dhauli Hill',
        description: 'Historic hill with ancient Buddhist caves and the famous Shanti Stupa. Offers panoramic views of the city and has great religious significance.',
        shortDescription: 'Buddhist site with Shanti Stupa',
        category: 'historical',
        rating: 4.4,
        reviewCount: 600,
        location: {
            type: 'Point',
            coordinates: [85.8459, 20.1915],
            address: 'Dhauli Hills, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '6:00 AM', close: '6:00 PM' },
        amenities: ['Temple', 'Stupa', 'View point'],
        isTrending: false,
        isFeatured: true,
        popularity: 550,
        estimatedVisitTime: '2 hours',
        images: [{ url: '/images/temple.png' }]
    },
    {
        name: 'Bhubaneswar Art Gallery',
        description: 'Contemporary art gallery featuring works by local and national artists. Regular exhibitions showcase various forms of visual arts.',
        shortDescription: 'Contemporary art gallery',
        category: 'museum',
        rating: 4.1,
        reviewCount: 300,
        location: {
            type: 'Point',
            coordinates: [85.8300, 20.2700],
            address: 'Sahid Nagar, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '10:00 AM', close: '7:00 PM' },
        amenities: ['Exhibitions'],
        isTrending: false,
        isFeatured: false,
        popularity: 250,
        estimatedVisitTime: '1 hour'
    },

    // PARKS
    {
        name: 'Ekamra Kanan',
        description: 'A beautiful botanical garden in the heart of the city. Known for its lush greenery, rare plant species, and peaceful environment.',
        shortDescription: 'Botanical garden in city center',
        category: 'park',
        rating: 4.3,
        reviewCount: 1500,
        location: {
            type: 'Point',
            coordinates: [85.8150, 20.2850],
            address: 'Ekamra Kanan Road, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: '₹10',
        timing: { open: '7:00 AM', close: '7:00 PM' },
        amenities: ['Walking trails', 'Photography', 'Seating'],
        isTrending: false,
        isFeatured: true,
        popularity: 600,
        estimatedVisitTime: '1-2 hours',
        images: [{ url: '/images/park.png' }]
    },
    {
        name: 'Biju Patnaik Park',
        description: 'A well-maintained urban park with beautifully landscaped gardens, fountains, and a children\'s play area.',
        shortDescription: 'Urban park with gardens',
        category: 'park',
        rating: 4.2,
        reviewCount: 800,
        location: {
            type: 'Point',
            coordinates: [85.8200, 20.2750],
            address: 'Sahid Nagar, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '5:00 AM', close: '10:00 PM' },
        amenities: ['Jogging track', 'Children play area', 'Food stalls'],
        isTrending: false,
        isFeatured: false,
        popularity: 450,
        estimatedVisitTime: '1 hour'
    },

    // MALLS
    {
        name: 'Esplanade One Mall',
        description: 'A premium shopping destination with international brands, multiplex cinema, and diverse dining options.',
        shortDescription: 'Premium shopping and entertainment',
        category: 'mall',
        rating: 4.3,
        reviewCount: 2000,
        location: {
            type: 'Point',
            coordinates: [85.8200, 20.2950],
            address: 'Rashtriya Matri, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '11:00 AM', close: '9:00 PM' },
        amenities: ['Multiplex', 'Food court', 'Parking'],
        isTrending: true,
        isFeatured: true,
        popularity: 850,
        estimatedVisitTime: '2-3 hours'
    },
    {
        name: 'Bhubaneswar Market Area',
        description: 'The main commercial hub of the city with a mix of branded stores, local shops, and street vendors.',
        shortDescription: 'Main commercial hub',
        category: 'shopping',
        rating: 4.0,
        reviewCount: 1500,
        location: {
            type: 'Point',
            coordinates: [85.8350, 20.2700],
            address: 'Market Square, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        entryFee: 'Free',
        timing: { open: '10:00 AM', close: '9:00 PM' },
        amenities: ['Bargaining', 'Street food'],
        isTrending: false,
        isFeatured: false,
        popularity: 700,
        estimatedVisitTime: '2 hours'
    },

    // HOTELS
    {
        name: 'Hotel Swosti Premium',
        description: 'Luxury hotel in the heart of Bhubaneswar with world-class amenities, multiple dining options, and excellent service.',
        shortDescription: 'Luxury hotel with premium amenities',
        category: 'hotel',
        rating: 4.5,
        reviewCount: 800,
        location: {
            type: 'Point',
            coordinates: [85.8200, 20.2900],
            address: 'Jharpada, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        price: { min: 5000, max: 15000 },
        amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Parking'],
        isTrending: true,
        isFeatured: true,
        popularity: 800,
        estimatedVisitTime: 'N/A'
    },
    {
        name: 'Hotel Hare Krishna',
        description: 'Budget-friendly hotel near the railway station with clean rooms and good service.',
        shortDescription: 'Budget hotel near station',
        category: 'hotel',
        rating: 4.0,
        reviewCount: 400,
        location: {
            type: 'Point',
            coordinates: [85.8300, 20.2650],
            address: 'Station Road, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        price: { min: 1200, max: 2500 },
        amenities: ['WiFi', 'Parking', 'Restaurant'],
        isTrending: false,
        isFeatured: false,
        popularity: 500,
        estimatedVisitTime: 'N/A'
    },
    {
        name: 'Mayfair Convention Centre',
        description: 'Upscale hotel with convention facilities, spa, and multiple restaurants. Perfect for business travelers.',
        shortDescription: 'Business hotel with convention center',
        category: 'hotel',
        rating: 4.4,
        reviewCount: 600,
        location: {
            type: 'Point',
            coordinates: [85.8100, 20.3000],
            address: 'Jaydev Vihar, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        price: { min: 4000, max: 12000 },
        amenities: ['Convention center', 'Pool', 'Spa', 'WiFi'],
        isTrending: false,
        isFeatured: true,
        popularity: 650,
        estimatedVisitTime: 'N/A'
    },

    // RESTAURANTS
    {
        name: 'Maa Hotel & Restaurant',
        description: 'Famous for authentic Odia cuisine. Must-try dishes include Dalma, Pakhala, and various fish preparations.',
        shortDescription: 'Authentic Odia cuisine',
        category: 'restaurant',
        rating: 4.5,
        reviewCount: 1200,
        location: {
            type: 'Point',
            coordinates: [85.8250, 20.2750],
            address: 'Sahid Nagar, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        priceRange: 'medium',
        cuisine: ['Odia', 'North Indian'],
        timing: { open: '7:00 AM', close: '10:00 PM' },
        amenities: ['AC', 'Parking', 'Home delivery'],
        isTrending: true,
        isFeatured: true,
        popularity: 900,
        estimatedVisitTime: '1 hour'
    },
    {
        name: 'Nagarjuna Restaurant',
        description: 'Popular South Indian restaurant known for its dosas, idlis, and authentic Andhra cuisine.',
        shortDescription: 'Popular South Indian cuisine',
        category: 'restaurant',
        rating: 4.4,
        reviewCount: 1000,
        location: {
            type: 'Point',
            coordinates: [85.8200, 20.2850],
            address: 'Sahid Nagar, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        priceRange: 'medium',
        cuisine: ['South Indian', 'North Indian'],
        timing: { open: '7:00 AM', close: '11:00 PM' },
        amenities: ['AC', 'WiFi', 'Parking'],
        isTrending: false,
        isFeatured: true,
        popularity: 700,
        estimatedVisitTime: '1 hour'
    },
    {
        name: 'Chillies Restaurant',
        description: 'Multi-cuisine restaurant with a beautiful ambiance. Known for its Chinese and Indian dishes.',
        shortDescription: 'Multi-cuisine dining',
        category: 'restaurant',
        rating: 4.3,
        reviewCount: 600,
        location: {
            type: 'Point',
            coordinates: [85.8150, 20.2950],
            address: 'Jaydev Vihar, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        priceRange: 'high',
        cuisine: ['Chinese', 'Indian', 'Continental'],
        timing: { open: '12:00 PM', close: '11:00 PM' },
        amenities: ['AC', 'Bar', 'Parking'],
        isTrending: false,
        isFeatured: false,
        popularity: 500,
        estimatedVisitTime: '1-2 hours'
    },
    {
        name: 'Krushna Lunch Home',
        description: 'Popular vegetarian restaurant serving authentic Odia and North Indian food at affordable prices.',
        shortDescription: 'Vegetarian Odia food',
        category: 'restaurant',
        rating: 4.2,
        reviewCount: 800,
        location: {
            type: 'Point',
            coordinates: [85.8400, 20.2600],
            address: 'Old Town, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        priceRange: 'low',
        cuisine: ['Vegetarian', 'Odia'],
        timing: { open: '7:00 AM', close: '9:00 PM' },
        amenities: ['Vegetarian only', 'Home delivery'],
        isTrending: false,
        isFeatured: false,
        popularity: 600,
        estimatedVisitTime: '45 mins'
    },

    // CAFES
    {
        name: 'Barista Coffee',
        description: 'Popular coffee chain with a cozy atmosphere. Great place for coffee lovers and casual meetings.',
        shortDescription: 'Coffee chain with cozy ambiance',
        category: 'cafe',
        rating: 4.2,
        reviewCount: 500,
        location: {
            type: 'Point',
            coordinates: [85.8200, 20.2850],
            address: 'Sahid Nagar, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        priceRange: 'medium',
        cuisine: ['Coffee', 'Snacks'],
        timing: { open: '8:00 AM', close: '11:00 PM' },
        amenities: ['WiFi', 'AC'],
        isTrending: false,
        isFeatured: false,
        popularity: 400,
        estimatedVisitTime: '1 hour'
    },
    {
        name: 'The Cafe - Hotel Swosti',
        description: 'Upscale cafe in a luxury hotel offering premium coffee, snacks, and desserts.',
        shortDescription: 'Premium hotel cafe',
        category: 'cafe',
        rating: 4.4,
        reviewCount: 300,
        location: {
            type: 'Point',
            coordinates: [85.8200, 20.2900],
            address: 'Hotel Swosti, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        priceRange: 'high',
        cuisine: ['Coffee', 'Continental'],
        timing: { open: '7:00 AM', close: '12:00 AM' },
        amenities: ['WiFi', 'AC', 'Parking'],
        isTrending: false,
        isFeatured: true,
        popularity: 350,
        estimatedVisitTime: '1 hour'
    },

    // EMERGENCY SERVICES
    {
        name: 'Capital Hospital',
        description: 'Government-run multi-specialty hospital with 24/7 emergency services.',
        shortDescription: 'Government multi-specialty hospital',
        category: 'hospital',
        rating: 4.0,
        reviewCount: 500,
        location: {
            type: 'Point',
            coordinates: [85.8500, 20.2700],
            address: 'Unit 6, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        contact: { phone: '0674-2390674' },
        amenities: ['24/7 Emergency', 'Ambulance', 'Pharmacy'],
        isTrending: false,
        isFeatured: false,
        popularity: 600,
        estimatedVisitTime: 'N/A'
    },
    {
        name: 'AMRI Hospitals',
        description: 'Private multi-specialty hospital with advanced medical facilities.',
        shortDescription: 'Private multi-specialty hospital',
        category: 'hospital',
        rating: 4.3,
        reviewCount: 800,
        location: {
            type: 'Point',
            coordinates: [85.7900, 20.3000],
            address: 'Sankarpada, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        contact: { phone: '0674-7110000' },
        amenities: ['24/7 Emergency', 'ICU', 'Pharmacy'],
        isTrending: false,
        isFeatured: false,
        popularity: 700,
        estimatedVisitTime: 'N/A'
    },
    {
        name: 'Gandhi Medical Store',
        description: '24-hour medical store near the main temple area.',
        shortDescription: '24-hour medical store',
        category: 'medical_store',
        rating: 4.2,
        reviewCount: 200,
        location: {
            type: 'Point',
            coordinates: [85.8250, 20.2700],
            address: 'Lingaraj Temple Road',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        amenities: ['24/7', 'Home delivery'],
        isTrending: false,
        isFeatured: false,
        popularity: 300,
        estimatedVisitTime: 'N/A'
    },
    {
        name: 'Commissionerate Police',
        description: 'Main police station for Bhubaneswar with 24/7 services.',
        shortDescription: 'Main police station',
        category: 'police',
        rating: 4.1,
        reviewCount: 150,
        location: {
            type: 'Point',
            coordinates: [85.8300, 20.2750],
            address: 'Bapuji Nagar, Bhubaneswar',
            city: 'Bhubaneswar',
            state: 'Odisha'
        },
        contact: { phone: '100' },
        amenities: ['24/7', 'Lost & Found'],
        isTrending: false,
        isFeatured: false,
        popularity: 200,
        estimatedVisitTime: 'N/A'
    }
];

// Hotel Schema
const hotelSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    images: Array,
    rating: Number,
    reviewCount: Number,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: Array,
        address: String,
        city: String,
        state: String
    },
    price: Object,
    amenities: Array,
    contact: Object,
    isTrending: Boolean,
    isFeatured: Boolean,
    popularity: Number
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    images: Array,
    rating: Number,
    reviewCount: Number,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: Array,
        address: String,
        city: String,
        state: String
    },
    priceRange: String,
    cuisine: Array,
    timing: Object,
    amenities: Array,
    isTrending: Boolean,
    isFeatured: Boolean,
    popularity: Number
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

async function seedDatabase() {
    try {
        // Clear existing data
        await Place.deleteMany({});
        await Hotel.deleteMany({});
        await Restaurant.deleteMany({});
        console.log('Existing data cleared');

        // Insert new data into Place collection
        await Place.insertMany(seedPlaces);
        console.log('Successfully seeded Places collection');

        // Extract hotels and restaurants from seed data
        const hotels = seedPlaces.filter(p => p.category === 'hotel');
        const restaurants = seedPlaces.filter(p => p.category === 'restaurant' || p.category === 'cafe');

        // Insert into Hotel collection
        if (hotels.length > 0) {
            await Hotel.insertMany(hotels);
            console.log(`Seeded ${hotels.length} hotels`);
        }

        // Insert into Restaurant collection
        if (restaurants.length > 0) {
            await Restaurant.insertMany(restaurants);
            console.log(`Seeded ${restaurants.length} restaurants/cafes`);
        }

        console.log(`Total places seeded: ${seedPlaces.length}`);
        console.log('Categories:', [...new Set(seedPlaces.map(p => p.category))]);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();