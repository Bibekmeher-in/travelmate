import React, { useState, useEffect } from 'react';
import { FiPhone, FiMapPin, FiNavigation, FiAlertCircle } from 'react-icons/fi';
import MapView from '../components/MapView';
import { emergencyAPI } from '../utils/api';

const Emergency = ({ userLocation }) => {
    const [loading, setLoading] = useState(true);
    const [emergencyData, setEmergencyData] = useState({ hospitals: [], medicalStores: [], policeStations: [] });
    const [numbers, setNumbers] = useState([]);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        loadData();
    }, [userLocation]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [servicesRes, numbersRes] = await Promise.all([
                emergencyAPI.getNearby({
                    lat: userLocation?.lat || 20.2961,
                    lng: userLocation?.lng || 85.8245
                }),
                emergencyAPI.getNumbers()
            ]);
            setEmergencyData(servicesRes.data.data);
            setNumbers(numbersRes.data.data);
        } catch (error) {
            console.error('Error loading emergency data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (number) => {
        window.location.href = `tel:${number}`;
    };

    const getAllServices = () => {
        if (activeTab === 'all') {
            return [
                ...emergencyData.hospitals,
                ...emergencyData.medicalStores,
                ...emergencyData.policeStations
            ];
        }
        return emergencyData[activeTab] || [];
    };

    return (
        <div className="min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                {/* Emergency Banner */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <FiAlertCircle className="text-4xl" />
                        <div>
                            <h1 className="text-2xl font-bold">Emergency Services</h1>
                            <p className="text-white/80">Quick access to urgent help</p>
                        </div>
                    </div>

                    {/* Quick Dial Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {numbers.slice(0, 4).map((item) => (
                            <button
                                key={item.number}
                                onClick={() => handleCall(item.number)}
                                className="flex flex-col items-center p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            >
                                <span className="text-2xl mb-1">{item.icon}</span>
                                <span className="font-bold">{item.number}</span>
                                <span className="text-xs">{item.service}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* All Emergency Numbers */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-md">
                    <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">All Emergency Numbers</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {numbers.map((item) => (
                            <button
                                key={item.number}
                                onClick={() => handleCall(item.number)}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                <div className="flex items-center space-x-2">
                                    <span>{item.icon}</span>
                                    <span className="font-medium">{item.service}</span>
                                </div>
                                <FiPhone className="text-primary-500" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-4 overflow-x-auto">
                    {['all', 'hospitals', 'medicalStores', 'policeStations'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === tab
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {tab === 'all' ? '🏥 All Services' :
                                tab === 'hospitals' ? '🏥 Hospitals' :
                                    tab === 'medicalStores' ? '💊 Medical Stores' : '👮 Police'}
                        </button>
                    ))}
                </div>

                {/* Map */}
                <div className="mb-4 sm:mb-6">
                    <MapView
                        places={getAllServices()}
                        userLocation={userLocation}
                        height="200px sm:250px md:300px"
                    />
                </div>

                {/* Services List */}
                {loading ? (
                    <div className="flex justify-center py-6 sm:py-8"><div className="spinner"></div></div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {getAllServices().map((service) => (
                            <div
                                key={service._id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0"
                            >
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">
                                            {service.category === 'hospital' ? '🏥' :
                                                service.category === 'medical_store' ? '💊' : '👮'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white">{service.name}</h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <FiMapPin className="w-4 h-4 mr-1" />
                                            {service.location.address || 'Address not available'}
                                        </div>
                                        {service.distanceKm && (
                                            <div className="flex items-center text-sm text-primary-500">
                                                <FiNavigation className="w-4 h-4 mr-1" />
                                                {service.distanceKm} km away
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {service.contact?.phone && (
                                    <button
                                        onClick={() => handleCall(service.contact.phone)}
                                        className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                                    >
                                        <FiPhone className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {getAllServices().length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No services found in this category</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Emergency;