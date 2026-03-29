import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiMapPin, FiNavigation } from 'react-icons/fi';
import PlaceCard from '../components/PlaceCard';
import MapView from '../components/MapView';
import { placesAPI } from '../utils/api';

const Explore = ({ userLocation }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [places, setPlaces] = useState([]);
    const [categories, setCategories] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        sort: 'distance',
        minRating: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadPlaces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, userLocation]);

    const loadCategories = async () => {
        try {
            const res = await placesAPI.getCategories();
            setCategories(res.data.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadPlaces = async () => {
        try {
            setLoading(true);
            const params = {
                lat: userLocation?.lat || 20.2961,
                lng: userLocation?.lng || 85.8245,
                radius: 500000,
                ...filters
            };
            delete params.category; // Use nearby instead for explore
            delete params.sort;

            const res = await placesAPI.getNearby({
                ...params,
                category: filters.category || undefined,
                sort: filters.sort
            });
            setPlaces(res.data.data);
        } catch (error) {
            console.error('Error loading places:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'category') {
            if (value) {
                searchParams.set('category', value);
            } else {
                searchParams.delete('category');
            }
            setSearchParams(searchParams);
        }
    };

    return (
        <div className="min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                            Explore Bhubaneswar
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                            {places.length} places to discover
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3 mt-3 sm:mt-0">
                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg"
                        >
                            <FiFilter />
                            <span>Filters</span>
                        </button>

                        {/* View Toggle */}
                        <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-primary-500 text-white' : ''} rounded-l-lg`}
                            >
                                <FiMapPin />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 ${viewMode === 'map' ? 'bg-primary-500 text-white' : ''} rounded-r-lg`}
                            >
                                <FiNavigation />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    className="input-field"
                                >
                                    <option value="distance">Nearest First</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="popularity">Most Popular</option>
                                </select>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Min Rating
                                </label>
                                <select
                                    value={filters.minRating}
                                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Any Rating</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="3">3+ Stars</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Pills */}
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                    <button
                        onClick={() => handleFilterChange('category', '')}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${!filters.category
                                ? 'bg-primary-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleFilterChange('category', cat.id)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${filters.category === cat.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-8 sm:py-12">
                        <div className="spinner"></div>
                    </div>
                ) : viewMode === 'map' ? (
                    <div className="rounded-xl overflow-hidden">
                            <MapView
                                places={places}
                                userLocation={userLocation}
                                height="600px"
                            />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {places.map(place => (
                            <PlaceCard key={place._id} place={place} showDistance={true} />
                        ))}
                    </div>
                )}

                {!loading && places.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No places found</p>
                        <p className="text-gray-400">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;