import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiCompass, FiTrendingUp, FiStar, FiPhone, FiCalendar } from 'react-icons/fi';
import PlaceCard from '../components/PlaceCard';
import MapView from '../components/MapView';
import { placesAPI, weatherAPI } from '../utils/api';

const Home = ({ userLocation, command, setCommand }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [feedData, setFeedData] = useState({ exploreNearby: [], trending: [], recommended: [] });
    const [weather, setWeather] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [activeSection, setActiveSection] = useState('explore');
    const [viewMode, setViewMode] = useState('list'); // list or map

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocation]);

    // Handle voice commands
    useEffect(() => {
        if (command) {
            if (command.action === 'hotels') {
                navigate('/hotels');
            } else if (command.action === 'restaurants') {
                navigate('/restaurants');
            } else if (command.action === 'temples') {
                navigate('/explore?category=temple');
            } else if (command.action === 'tripPlanner') {
                navigate('/trip-planner');
            } else if (command.action === 'emergency') {
                navigate('/emergency');
            } else if (command.action === 'nearby') {
                // Refresh nearby data
                loadFeedData();
            }
            setCommand(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [command, navigate, setCommand]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load weather
            const weatherRes = await weatherAPI.getCurrent({
                lat: userLocation?.lat || 20.2961,
                lng: userLocation?.lng || 85.8245
            });
            setWeather(weatherRes.data.data);

            // Load categories
            const catRes = await placesAPI.getCategories();
            setCategories(catRes.data.data);

            // Load feed data
            await loadFeedData();
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFeedData = async () => {
        try {
            const feedRes = await placesAPI.getFeed({
                lat: userLocation?.lat || 20.2961,
                lng: userLocation?.lng || 85.8245
            });
            setFeedData(feedRes.data.data);
        } catch (error) {
            console.error('Error loading feed:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>

                <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                            🏯 TravelMate Bhubaneswar AI
                        </h1>
                        <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8">
                            Your AI-powered travel companion for the Temple City
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-2 sm:px-0">
                            <div className="relative">
                                <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="text"
                                    placeholder="Search places, hotels, restaurants..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl text-gray-800 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
                                />
                            </div>
                        </form>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 px-2">
                            <Link to="/trip-planner" className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm transition-colors">
                                <FiCalendar />
                                <span>Plan My Trip</span>
                            </Link>
                            <Link to="/explore?category=temple" className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm transition-colors">
                                <span>🛕</span>
                                <span>Temples</span>
                            </Link>
                            <Link to="/hotels" className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm transition-colors">
                                <span>🏨</span>
                                <span>Hotels</span>
                            </Link>
                            <Link to="/restaurants" className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm transition-colors">
                                <span>🍽️</span>
                                <span>Food</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weather & Location */}
            {weather && (
                <div className="max-w-7xl mx-auto px-4 -mt-6 sm:-mt-8 relative z-10">
                    <div className="glass rounded-xl p-3 sm:p-4 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <span className="text-3xl sm:text-4xl">{weather.icon}</span>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold">{weather.temperature}°C</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{weather.condition}</p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="font-medium text-sm sm:text-base">{weather.currentSeason}</p>
                                <p className="text-xs sm:text-sm text-gray-500">{weather.bestTimeToVisit}</p>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <FiMapPin className="w-4 h-4" />
                                <span>Bhubaneswar</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                    {categories?.map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/explore?category=${cat.id}`}
                            className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center min-w-[100px]"
                        >
                            <span className="text-3xl block mb-2">{cat.icon}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* View Toggle */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {[
                            { id: 'explore', label: 'Explore Nearby', icon: FiMapPin },
                            { id: 'trending', label: 'Trending', icon: FiTrendingUp },
                            { id: 'recommended', label: 'Recommended', icon: FiStar },
                        ].map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeSection === section.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <section.icon className="w-4 h-4" />
                                <span className="font-medium">{section.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600'}`}
                        >
                            <FiCompass className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600'}`}
                        >
                            <FiMapPin className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'map' ? (
                    <div className="mb-4 sm:mb-8">
                        <MapView
                            places={feedData[activeSection === 'explore' ? 'exploreNearby' : activeSection === 'trending' ? 'trending' : 'recommended'] || []}
                            userLocation={userLocation}
                            height="300px sm:400px md:500px"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
                        {(feedData[activeSection === 'explore' ? 'exploreNearby' : activeSection === 'trending' ? 'trending' : 'recommended'] || []).map((place) => (
                            <PlaceCard key={place._id} place={place} showDistance={true} />
                        ))}
                    </div>
                )}

                {((feedData[activeSection === 'explore' ? 'exploreNearby' : activeSection === 'trending' ? 'trending' : 'recommended'] || []).length === 0) && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No places found in this section</p>
                        <Link to="/explore" className="btn-primary mt-4 inline-block">
                            Explore All Places
                        </Link>
                    </div>
                )}
            </div>

            {/* AI Features Section */}
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white py-8 sm:py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">✨ AI Features</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Link to="/trip-planner" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors text-center">
                            <div className="text-4xl mb-4">🤖</div>
                            <h3 className="text-xl font-semibold mb-2">AI Trip Planner</h3>
                            <p className="text-white/80">Get personalized itineraries based on your budget, interests, and duration</p>
                        </Link>

                        <Link to="/trip-planner?type=budget" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors text-center">
                            <div className="text-4xl mb-4">💰</div>
                            <h3 className="text-xl font-semibold mb-2">Budget Calculator</h3>
                            <p className="text-white/80">Calculate estimated costs for hotels, food, transport, and more</p>
                        </Link>

                        <Link to="/explore" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors text-center">
                            <div className="text-4xl mb-4">⭐</div>
                            <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
                            <p className="text-white/80">Get personalized suggestions based on rating, distance, and popularity</p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Emergency Quick Access */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white">🆘 Emergency Services</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { name: 'Police', number: '100', icon: '👮' },
                        { name: 'Ambulance', number: '102', icon: '🚑' },
                        { name: 'Fire', number: '101', icon: '🚒' },
                        { name: 'Tourist Police', number: '1363', icon: '🎒' },
                    ].map((item) => (
                        <a
                            key={item.number}
                            href={`tel:${item.number}`}
                            className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.number}</p>
                                </div>
                            </div>
                            <FiPhone className="text-primary-500" />
                        </a>
                    ))}
                </div>
                <Link to="/emergency" className="block text-center mt-4 text-primary-500 hover:text-primary-600 font-medium">
                    View all emergency services →
                </Link>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-bold">TravelMate Bhubaneswar AI</h3>
                            <p className="text-gray-400">Your intelligent travel companion</p>
                        </div>
                        <div className="flex space-x-4">
                            <Link to="/about" className="text-gray-400 hover:text-white">About</Link>
                            <Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link>
                            <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
                        </div>
                    </div>
                    <div className="mt-4 text-center text-gray-400 text-sm">
                        © 2024 TravelMate Bhubaneswar AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;