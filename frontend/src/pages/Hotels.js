import React, { useState, useEffect } from 'react';
import { FiMapPin, FiStar, FiExternalLink } from 'react-icons/fi';
import { hotelsAPI } from '../utils/api';

const Hotels = ({ userLocation }) => {
    const [loading, setLoading] = useState(true);
    const [hotels, setHotels] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        loadHotels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, userLocation]);

    const loadHotels = async () => {
        try {
            setLoading(true);
            const res = await hotelsAPI.getNearby({
                lat: userLocation?.lat || 20.2961,
                lng: userLocation?.lng || 85.8245,
                ...filters
            });
            setHotels(res.data.data);
        } catch (error) {
            console.error('Error loading hotels:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            budget: 'bg-green-100 text-green-800',
            standard: 'bg-blue-100 text-blue-800',
            luxury: 'bg-purple-100 text-purple-800',
            resort: 'bg-orange-100 text-orange-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                        🏨 Hotels in Bhubaneswar
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                        Find the perfect stay for your trip
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                className="input-field"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All</option>
                                <option value="budget">Budget</option>
                                <option value="standard">Standard</option>
                                <option value="luxury">Luxury</option>
                                <option value="resort">Resort</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Min Price</label>
                            <select
                                className="input-field"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            >
                                <option value="">Any</option>
                                <option value="500">₹500+</option>
                                <option value="1000">₹1000+</option>
                                <option value="2000">₹2000+</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Max Price</label>
                            <select
                                className="input-field"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            >
                                <option value="">Any</option>
                                <option value="2000">Up to ₹2000</option>
                                <option value="5000">Up to ₹5000</option>
                                <option value="10000">Up to ₹10000</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8 sm:py-12"><div className="spinner"></div></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {hotels.map((hotel) => (
                            <div key={hotel._id} className="card">
                                <div className="h-40 sm:h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                    <span className="text-5xl sm:text-6xl">🏨</span>
                                </div>
                                <div className="p-3 sm:p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{hotel.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(hotel.category)}`}>
                                            {hotel.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{hotel.description}</p>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-1 text-primary-500">
                                            <FiStar className="w-4 h-4 fill-current" />
                                            <span className="font-medium">{hotel.rating?.toFixed(1) || '0.0'}</span>
                                        </div>
                                        {hotel.distanceKm && (
                                            <span className="text-sm text-gray-500 flex items-center">
                                                <FiMapPin className="w-3 h-3 mr-1" /> {hotel.distanceKm} km
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xl font-bold text-primary-500">₹{hotel.price?.min || 'N/A'}</span>
                                            <span className="text-sm text-gray-500"> / night</span>
                                        </div>
                                        {hotel.bookingUrl && (
                                            <a
                                                href={hotel.bookingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-1 text-primary-500 hover:text-primary-600"
                                            >
                                                <span>Book</span>
                                                <FiExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && hotels.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No hotels found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hotels;