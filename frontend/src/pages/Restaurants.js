import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiMapPin, FiStar, FiClock } from 'react-icons/fi';
import { restaurantsAPI } from '../utils/api';

const Restaurants = ({ userLocation }) => {
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState([]);
    const [filters, setFilters] = useState({ category: '', priceRange: '' });

    useEffect(() => {
        loadRestaurants();
    }, [filters, userLocation]);

    const loadRestaurants = async () => {
        try {
            setLoading(true);
            const res = await restaurantsAPI.getNearby({
                lat: userLocation?.lat || 20.2961,
                lng: userLocation?.lng || 85.8245,
                ...filters
            });
            setRestaurants(res.data.data);
        } catch (error) {
            console.error('Error loading restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            veg: 'bg-green-100 text-green-800',
            non_veg: 'bg-red-100 text-red-800',
            cafe: 'bg-yellow-100 text-yellow-800',
            fine_dining: 'bg-purple-100 text-purple-800',
            fast_food: 'bg-orange-100 text-orange-800',
            local: 'bg-blue-100 text-blue-800',
            multi_cuisine: 'bg-teal-100 text-teal-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                        🍽️ Restaurants in Bhubaneswar
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Discover the best food in the city</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                className="input-field"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All</option>
                                <option value="veg">🥗 Veg</option>
                                <option value="non_veg">🍖 Non-Veg</option>
                                <option value="cafe">☕ Cafe</option>
                                <option value="fine_dining">🍷 Fine Dining</option>
                                <option value="local">🍛 Local</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Price Range</label>
                            <select
                                className="input-field"
                                value={filters.priceRange}
                                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                            >
                                <option value="">Any</option>
                                <option value="low">₹ Budget</option>
                                <option value="medium">₹₹ Moderate</option>
                                <option value="high">₹₹₹ Premium</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8 sm:py-12"><div className="spinner"></div></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {restaurants.map((restaurant) => (
                            <div key={restaurant._id} className="card">
                                <div className="h-40 sm:h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                                    <span className="text-5xl sm:text-6xl">🍽️</span>
                                </div>
                                <div className="p-3 sm:p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{restaurant.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(restaurant.category)}`}>
                                            {restaurant.category?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{restaurant.description}</p>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-1 text-primary-500">
                                            <FiStar className="w-4 h-4 fill-current" />
                                            <span className="font-medium">{restaurant.rating?.toFixed(1) || '0.0'}</span>
                                        </div>
                                        {restaurant.distanceKm && (
                                            <span className="text-sm text-gray-500 flex items-center">
                                                <FiMapPin className="w-3 h-3 mr-1" /> {restaurant.distanceKm} km
                                            </span>
                                        )}
                                    </div>
                                    {restaurant.timing && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <FiClock className="w-4 h-4 mr-1" />
                                            {restaurant.timing.open} - {restaurant.timing.close}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && restaurants.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No restaurants found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Restaurants;