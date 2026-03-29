import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiMapPin, FiPhone, FiNavigation, FiShare2, FiHeart } from 'react-icons/fi';
import MapView from '../components/MapView';
import PlaceCard from '../components/PlaceCard';
import { placesAPI, transportAPI, routingAPI } from '../utils/api';

const PlaceDetail = ({ userLocation }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [nearby, setNearby] = useState([]);
    const [transportOptions, setTransportOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showRoute, setShowRoute] = useState(false);
    const [routeGeometry, setRouteGeometry] = useState(null);
    const [loadingRoute, setLoadingRoute] = useState(false);

    useEffect(() => {
        loadPlace();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadPlace = async () => {
        try {
            setLoading(true);
            const [placeRes, nearbyRes] = await Promise.all([
                placesAPI.getById(id),
                placesAPI.getNearbyAttractions(id)
            ]);
            setPlace(placeRes.data.data);
            setNearby(nearbyRes.data.data || []);
            
            // Auto-load route if user location is available
            if (userLocation && placeRes.data.data?.location?.coordinates) {
                await getRoute(userLocation, placeRes.data.data);
            }
        } catch (error) {
            console.error('Error loading place:', error);
            navigate('/explore');
        } finally {
            setLoading(false);
        }
    };

    const getRoute = async (userLoc, placeData = place) => {
        if (!userLoc || !placeData?.location?.coordinates) return;
        
        try {
            setLoadingRoute(true);
            const destLat = placeData.location.coordinates[1];
            const destLng = placeData.location.coordinates[0];
            
            const response = await routingAPI.getRoute(
                userLoc.lat,
                userLoc.lng,
                destLat,
                destLng
            );
            
            // OSRM returns { routes: [{ geometry, distance, duration }] }
            if (response.data && response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                setRouteGeometry(route.geometry);
                setShowRoute(true);
            }
        } catch (error) {
            console.error('Error getting route:', error);
            // Fallback: try direct distance calculation
            if (placeData?.location?.coordinates && userLoc) {
                const R = 6371; // Earth's radius in km
                const dLat = (placeData.location.coordinates[1] - userLoc.lat) * Math.PI / 180;
                const dLon = (placeData.location.coordinates[0] - userLoc.lng) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLoc.lat * Math.PI / 180) * Math.cos(placeData.location.coordinates[1] * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c;
                const duration = Math.round((distance / 30) * 60); // Assume 30 km/h avg speed
                setShowRoute(true);
            }
        } finally {
            setLoadingRoute(false);
        }
    };

    const handleGetDirections = () => {
        if (userLocation && place) {
            getRoute(userLocation, place);
        } else if (!userLocation) {
            alert('Please enable location services to get directions');
        }
    };

    const loadTransportOptions = async () => {
        if (!userLocation || !place) return;
        try {
            const res = await transportAPI.getFromUser({
                userLat: userLocation.lat,
                userLng: userLocation.lng,
                destLat: place.location.coordinates[1],
                destLng: place.location.coordinates[0],
                destName: place.name
            });
            setTransportOptions(res.data.data.transportOptions || []);
        } catch (error) {
            console.error('Error loading transport:', error);
        }
    };

    useEffect(() => {
        if (userLocation && place && activeTab === 'transport') {
            loadTransportOptions();
        }
        // Load route when place is loaded and user location is available
        if (place && userLocation && !showRoute && !routeGeometry) {
            getRoute(userLocation, place);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, userLocation, place]);

    useEffect(() => {
        setShowRoute(false);
        setRouteGeometry(null);
    }, [id]);

    const getCategoryIcon = (category) => {
        const icons = {
            temple: '🛕', tourist_place: '🏛️', park: '🌳', mall: '🏬',
            hotel: '🏨', restaurant: '🍽️', cafe: '☕', museum: '🏛️',
            historical: '📜', shopping: '🛍️'
        };
        return icons[category] || '📍';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!place) return null;

    return (
        <div className="min-h-screen pt-16 pb-8 sm:pb-12">
            {/* Hero Image */}
            <div className="relative h-48 sm:h-64 md:h-96">
                <img
                    src={place.images?.[0]?.url || 'https://images.unsplash.com/photo-1567393524177-c24f1a4d92d6?w=1200&h=600&fit=crop'}
                    alt={place.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 text-white">
                    <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                        <span className="px-2 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm">
                            {getCategoryIcon(place.category)} {place.category?.replace('_', ' ')}
                        </span>
                        {place.isTrending && (
                            <span className="px-2 py-0.5 sm:py-1 bg-accent-500 rounded-full text-xs sm:text-sm">Trending</span>
                        )}
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{place.name}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
                        <div className="flex items-center">
                            <FiStar className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                            <span>{place.rating?.toFixed(1)} ({place.reviewCount} reviews)</span>
                        </div>
                        {place.distanceKm && (
                            <div className="flex items-center">
                                <FiMapPin className="w-4 h-4 mr-1" />
                                <span>{place.distanceKm} km away</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                {/* Action Buttons */}
                <div className="flex space-x-2 sm:space-x-3 py-3 sm:py-4 -mt-6 sm:-mt-8 relative z-10 px-1">
                    <button 
                        onClick={handleGetDirections}
                        disabled={loadingRoute}
                        className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 bg-primary-500 text-white py-2 sm:py-3 rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm sm:text-base"
                    >
                        <FiNavigation className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{loadingRoute ? 'Loading...' : showRoute ? 'View Route' : 'Get Directions'}</span>
                    </button>
                    <button className="flex items-center justify-center p-2 sm:px-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button className="flex items-center justify-center p-2 sm:px-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <FiHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {['overview', 'transport', 'nearby'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === tab
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {tab === 'overview' ? '📋 Overview' :
                                tab === 'transport' ? '🚗 Transport' :
                                    '🏛️ Nearby Attractions'}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                                <h2 className="text-xl font-semibold mb-4">About</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{place.description}</p>
                            </div>

                            {place.amenities?.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                                    <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {place.amenities.map((amenity, index) => (
                                            <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md">
                                <h2 className="text-xl font-semibold mb-4">Location</h2>
                                <MapView
                                    places={[place]}
                                    selectedPlace={place}
                                    userLocation={userLocation}
                                    height="300px"
                                    showRoute={showRoute}
                                    routeGeometry={routeGeometry}
                                    showUserMarker={!!userLocation}
                                />
                                {place.location?.address && (
                                    <div className="flex items-center mt-3 text-gray-600 dark:text-gray-400">
                                        <FiMapPin className="w-4 h-4 mr-2" />
                                        <span>{place.location.address}, {place.location.city}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                                <h2 className="text-xl font-semibold mb-4">Quick Info</h2>
                                <div className="space-y-3">
                                    {place.entryFee && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Entry Fee</span>
                                            <span className="font-medium text-primary-500">{place.entryFee}</span>
                                        </div>
                                    )}
                                    {place.timing && typeof place.timing === 'object' && !Array.isArray(place.timing) && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Timing</span>
                                            <span className="font-medium">{place.timing.open} - {place.timing.close}</span>
                                        </div>
                                    )}
                                    {place.estimatedVisitTime && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Best Time</span>
                                            <span className="font-medium">{place.estimatedVisitTime}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {place.contact?.phone && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                                    <h2 className="text-xl font-semibold mb-4">Contact</h2>
                                    <a href={`tel:${place.contact.phone}`} className="flex items-center space-x-2 text-primary-500">
                                        <FiPhone className="w-5 h-5" />
                                        <span>{place.contact.phone}</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'transport' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">🚗 Get There</h2>
                        {transportOptions.length > 0 ? (
                            <div className="space-y-3">
                                {transportOptions.map((option, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3 sm:gap-0">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl sm:text-2xl">{option.icon}</span>
                                            <div>
                                                <p className="font-medium text-sm sm:text-base">{option.name}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">₹{option.estimatedFare} • {option.eta} min</p>
                                            </div>
                                        </div>
                                        {option.bookingUrl && (
                                            <a href={option.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm self-end sm:self-auto">
                                                Book Now
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Enable location to see transport options</p>
                        )}
                    </div>
                )}

                {activeTab === 'nearby' && (
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">🏛️ Nearby Attractions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {nearby.map((place) => (
                                <PlaceCard key={place._id} place={place} showDistance={true} />
                            ))}
                        </div>
                        {nearby.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No nearby attractions found</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaceDetail;