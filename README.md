# 🏯 TravelMate Bhubaneswar AI

A full-stack MERN application for intelligent tourism guidance in Bhubaneswar, India.

## 🌟 Features

### Core Features
- **User Authentication**: JWT + Google OAuth with role-based access (User/Admin)
- **Smart Location-Based Feed**: Real-time user location tracking with nearest places
- **Bhubaneswar Data**: Complete dataset with temples, hotels, restaurants, parks, malls, etc.
- **Tourism Places Module**: CRUD operations with detailed information
- **Hotel Module**: Filter by budget, amenities, price range
- **Restaurant Module**: Filter by veg/non-veg, cafe, fine dining
- **Emergency Module**: Hospitals, medical stores, police stations with quick dial
- **Transport Module**: Fare estimation for Ola, Uber, Rapido, etc.
- **Map & Navigation**: Leaflet maps with OpenStreetMap integration
- **AI Features**: Trip planner, budget calculator, recommendation engine
- **Voice Assistant**: Web Speech API for voice commands

### Additional Features
- Dark mode support
- Multi-language (English, Hindi, Odia)
- Review & rating system
- Responsive design (Mobile-first)
- Infinite scroll feed
- Map + List view toggle

## 🛠️ Tech Stack

### Frontend
- React.js 18
- Tailwind CSS 3
- Leaflet.js (OpenStreetMap)
- React Router DOM
- Context API for state
- Axios for API calls

### Backend
- Node.js + Express.js
- MongoDB with GeoJSON + 2dsphere index
- JWT Authentication
- Google OAuth
- RESTful APIs

## 📁 Project Structure

```
Smart-Tourism-Bhubaneswar-AI/
├── backend/
│   ├── controllers/      # Business logic
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Utility functions
│   ├── data/             # Seed data
│   ├── package.json
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utility functions
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_tourism_bhubaneswar
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Start the backend server:
```bash
npm run dev    # Development mode
# OR
npm start      # Production mode
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`

### Seed Database

```bash
cd backend
npm run seed
```

This will populate the database with Bhubaneswar tourism data.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Places
- `GET /api/places` - Get all places
- `GET /api/places/nearby` - Get nearby places (geospatial)
- `GET /api/places/feed` - Get smart feed
- `GET /api/places/:id` - Get place details
- `POST /api/places` - Create place (Admin)
- `PUT /api/places/:id` - Update place (Admin)
- `DELETE /api/places/:id` - Delete place (Admin)

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/nearby` - Get nearby hotels
- `POST /api/hotels` - Create hotel (Admin)

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/nearby` - Get nearby restaurants

### Emergency
- `GET /api/emergency/nearby` - Get emergency services
- `GET /api/emergency/numbers` - Get emergency numbers

### Transport
- `GET /api/transport/fare` - Estimate fare
- `GET /api/transport/route` - Get route

### AI
- `POST /api/ai/trip-planner` - Generate trip itinerary
- `POST /api/ai/budget-calculator` - Calculate budget
- `GET /api/ai/recommendations` - Get recommendations
- `POST /api/ai/chat` - Chat with AI

## 🎨 UI Components

### Key Components
- **Navbar**: Responsive navigation with mobile menu
- **PlaceCard**: Display place info with images
- **MapView**: Leaflet map integration
- **VoiceAssistant**: Voice command interface

### Pages
- **Home**: Hero section, search, categories, feed sections
- **Explore**: Filterable places with map/list toggle
- **Hotels**: Hotel listings with filters
- **Restaurants**: Restaurant listings with filters
- **Emergency**: Emergency services with quick dial
- **PlaceDetail**: Full place information
- **TripPlanner**: AI-powered trip planning
- **Admin**: Dashboard for management

## 🔧 Configuration

### MongoDB Geospatial Queries
The app uses MongoDB's 2dsphere index for location-based queries:
```javascript
placeSchema.index({ location: '2dsphere' });
```

### Geolocation
User location is tracked using browser Geolocation API:
```javascript
navigator.geolocation.getCurrentPosition()
```

### Voice Commands
Supported commands:
- "Show nearby hotels"
- "Find restaurants"
- "Show temples"
- "Plan my trip"
- "Show emergency services"

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🌍 Bhubaneswar Data Categories

1. **Temples**: Lingaraj Temple, Mukteshwar, Rajarani Temple
2. **Tourist Places**: Nandankanan, Odisha State Museum
3. **Parks**: Ekamra Kanan, Biju Patnaik Park
4. **Malls**: Esplanade One Mall
5. **Hotels**: Various categories (budget to luxury)
6. **Restaurants**: Local Odia, South Indian, Multi-cuisine
7. **Cafes**: Coffee chains, hotel cafes
8. **Museums**: State Museum, Art Gallery
9. **Historical**: Khandagiri Caves, Dhauli Hill
10. **Emergency**: Hospitals, Medical stores, Police

## 📝 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Developer Notes

- Ensure MongoDB is running before starting the backend
- For Google OAuth, obtain credentials from Google Cloud Console
- Map tiles are from OpenStreetMap (free to use)
- Weather data is mock - integrate with OpenWeatherMap API for real data

---

Built with ❤️ from Bibek
