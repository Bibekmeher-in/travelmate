import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom markers
const createCustomIcon = (color = '#0ea5e9', size = 30) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size]
    });
};

// User location marker
const userIcon = createCustomIcon('#10b981', 24);

// Place marker
const placeIcon = createCustomIcon('#0ea5e9', 30);

// Selected place marker
const selectedIcon = createCustomIcon('#a855f7', 36);

// Component to update map center and fit bounds
const MapUpdater = ({ center, routeGeometry, userLocation, places, selectedPlace }) => {
    const map = useMap();

    useEffect(() => {
        if (routeGeometry) {
            // Fit bounds to show the entire route
            let bounds = [];

            // Add user location if available
            if (userLocation) {
                bounds.push([userLocation.lat, userLocation.lng]);
            }

            // Add route coordinates
            if (routeGeometry.coordinates) {
                routeGeometry.coordinates.forEach(coord => {
                    bounds.push([coord[1], coord[0]]); // Swap lng,lat to lat,lng
                });
            }

            // Add place location
            if (selectedPlace?.location?.coordinates) {
                bounds.push([selectedPlace.location.coordinates[1], selectedPlace.location.coordinates[0]]);
            }

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        } else if (center) {
            map.setView([center.lat, center.lng], map.getZoom());
        }
    }, [center, routeGeometry, map, userLocation, selectedPlace]);

    return null;
};

// Click handler component
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (onMapClick) {
                onMapClick(e.latlng);
            }
        }
    });
    return null;
};

// Route polyline component
const RoutePolyline = ({ routeGeometry, color = '#0ea5e9' }) => {
    if (!routeGeometry) return null;

    let coordinates = [];

    // Handle different OSRM response formats
    if (routeGeometry.coordinates) {
        // GeoJSON format: [[lng, lat], [lng, lat], ...]
        coordinates = routeGeometry.coordinates.map(coord => [coord[1], coord[0]]);
    } else if (Array.isArray(routeGeometry)) {
        // Array of [lat, lng] or [lng, lat]
        coordinates = routeGeometry.map(coord => {
            if (coord.length >= 2) {
                // If first value is latitude, use as is
                if (coord[0] >= -90 && coord[0] <= 90) {
                    return coord;
                }
                // Otherwise swap (lng, lat) -> (lat, lng)
                return [coord[1], coord[0]];
            }
            return coord;
        });
    }

    if (coordinates.length === 0) return null;

    return (
        <Polyline
            positions={coordinates}
            pathOptions={{ color, weight: 5, opacity: 0.9 }}
        />
    );
};

// Full map component
const MapView = ({
    places = [],
    userLocation = null,
    selectedPlace = null,
    destination = null,
    onPlaceSelect,
    onMapClick,
    showRoute = false,
    routeGeometry = null,
    height = '400px',
    center = null,
    zoom = 13,
    showUserMarker = true,
    className = ''
}) => {
    const defaultCenter = [20.2961, 85.8245]; // Bhubaneswar
    const mapRef = useRef(null);

    const mapCenter = center
        ? [center.lat, center.lng]
        : userLocation
            ? [userLocation.lat, userLocation.lng]
            : defaultCenter;

    const handleMarkerClick = (place) => {
        if (onPlaceSelect) {
            onPlaceSelect(place);
        }
    };

    const handleDestinationClick = () => {
        if (onPlaceSelect && destination) {
            onPlaceSelect(destination);
        }
    };

    return (
        <div className={`rounded-xl overflow-hidden w-full ${className}`}>
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height }}
                ref={mapRef}
                className="z-0"
            >
                {/* OpenStreetMap Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater
                    center={center || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)}
                    routeGeometry={showRoute ? routeGeometry : null}
                    userLocation={userLocation}
                    places={places}
                    selectedPlace={selectedPlace}
                />
                <MapClickHandler onMapClick={onMapClick} />

                {/* Route Polyline */}
                {showRoute && routeGeometry && (
                    <RoutePolyline routeGeometry={routeGeometry} />
                )}

                {/* User Location Marker */}
                {showUserMarker && userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={userIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <p className="font-medium">📍 Your Location</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Place Markers */}
                {places.map((place) => (
                    <Marker
                        key={place._id}
                        position={[
                            place.location.coordinates[1],
                            place.location.coordinates[0]
                        ]}
                        icon={selectedPlace?._id === place._id ? selectedIcon : placeIcon}
                        eventHandlers={{
                            click: () => handleMarkerClick(place)
                        }}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                <h3 className="font-semibold text-lg">{place.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{place.shortDescription}</p>
                                <div className="flex items-center justify-between mt-2 text-sm">
                                    <span className="text-primary-500 font-medium">⭐ {place.rating?.toFixed(1)}</span>
                                    {place.distanceKm && (
                                        <span className="text-gray-500">📍 {place.distanceKm} km</span>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Selected Place Marker */}
                {selectedPlace && !places.find(p => p._id === selectedPlace._id) && (
                    <Marker
                        position={[
                            selectedPlace.location.coordinates[1],
                            selectedPlace.location.coordinates[0]
                        ]}
                        icon={selectedIcon}
                    >
                        <Popup>
                            <div>
                                <h3 className="font-semibold">{selectedPlace.name}</h3>
                                <p className="text-sm">{selectedPlace.shortDescription}</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Destination Marker */}
                {destination && !selectedPlace && (
                    <Marker
                        position={[destination.lat, destination.lng]}
                        icon={selectedIcon}
                        eventHandlers={{
                            click: handleDestinationClick
                        }}
                    >
                        <Popup>
                            <div>
                                <h3 className="font-semibold">📍 Destination</h3>
                                <p className="text-sm">{destination.name || 'Selected destination'}</p>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default MapView;