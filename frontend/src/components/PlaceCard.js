import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiClock, FiHeart, FiNavigation } from 'react-icons/fi';

const PlaceCard = ({ place, onFavorite, isFavorite, showDistance = true }) => {
    const getCategoryIcon = (category) => {
        const icons = {
            temple: '🛕',
            tourist_place: '🏛️',
            park: '🌳',
            mall: '🏬',
            hotel: '🏨',
            restaurant: '🍽️',
            cafe: '☕',
            museum: '🏛️',
            historical: '📜',
            shopping: '🛍️',
            hospital: '🏥',
            police: '👮',
            medical_store: '💊'
        };
        return icons[category] || '📍';
    };

    return (
        <div className="card group hover:-translate-y-1 h-full flex flex-col">
            {/* Image */}
            <div className="relative h-40 sm:h-48 overflow-hidden flex-shrink-0">
                <img
                    src={place.images?.[0]?.url || '/images/temple.png'}
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium flex items-center space-x-1">
                        <span>{getCategoryIcon(place.category)}</span>
                        <span className="capitalize">{place.category?.replace('_', ' ')}</span>
                    </span>
                </div>

                {/* Favorite Button */}
                {onFavorite && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onFavorite(place._id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                        <FiHeart
                            className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                        />
                    </button>
                )}

                {/* Trending Badge */}
                {place.isTrending && (
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 px-2 py-0.5 sm:py-1 bg-accent-500 text-white text-xs font-medium rounded-full">
                        Trending
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-1">
                        {place.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-primary-500">
                        <FiStar className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{place.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {place.shortDescription || place.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                        {place.timing && typeof place.timing === 'object' && !Array.isArray(place.timing) && place.timing.open && (
                            <span className="flex items-center space-x-1">
                                <FiClock className="w-3 h-3" />
                                <span>{place.timing.open}</span>
                            </span>
                        )}
                        {place.entryFee && (
                            <span className="text-primary-500 font-medium">
                                {typeof place.entryFee === 'string' ? place.entryFee : 'Free'}
                            </span>
                        )}
                    </div>

                    {showDistance && place.distanceKm && (
                        <div className="flex items-center space-x-1 text-primary-500">
                            <FiNavigation className="w-3 h-3" />
                            <span>{place.distanceKm} km</span>
                        </div>
                    )}
                </div>

                {/* Location */}
                {place.location?.address && (
                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <FiMapPin className="w-3 h-3" />
                        <span className="truncate">{place.location.address}</span>
                    </div>
                )}

                {/* Action Button */}
                <Link
                    to={`/place/${place._id}`}
                    className="mt-auto pt-2 sm:pt-3 block w-full text-center py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default PlaceCard;