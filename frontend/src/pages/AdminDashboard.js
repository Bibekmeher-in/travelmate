import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiMapPin, FiHome, FiCoffee, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [stats, setStats] = useState({ users: 0, places: 0, hotels: 0, restaurants: 0 });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
        loadStats();
    }, [isAdmin, navigate]);

    const loadStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    return (
        <div className="min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage your tourism platform</p>
                    </div>
                    <button className="btn-primary flex items-center justify-center space-x-2 py-2 sm:py-0">
                        <FiPlus />
                        <span>Add New</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {[
                        { label: 'Users', value: stats.users, icon: FiUsers, color: 'bg-blue-500' },
                        { label: 'Places', value: stats.places, icon: FiMapPin, color: 'bg-primary-500' },
                        { label: 'Hotels', value: stats.hotels, icon: FiHome, color: 'bg-green-500' },
                        { label: 'Restaurants', value: stats.restaurants, icon: FiCoffee, color: 'bg-orange-500' },
                    ].map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <Link to="/admin/places/new" className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg text-center">
                        <FiMapPin className="w-8 h-8 mx-auto text-primary-500 mb-2" />
                        <span className="text-sm font-medium">Add Place</span>
                    </Link>
                    <Link to="/admin/hotels/new" className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg text-center">
                        <FiHome className="w-8 h-8 mx-auto text-green-500 mb-2" />
                        <span className="text-sm font-medium">Add Hotel</span>
                    </Link>
                    <Link to="/admin/restaurants/new" className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg text-center">
                        <FiCoffee className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                        <span className="text-sm font-medium">Add Restaurant</span>
                    </Link>
                    <Link to="/admin/users" className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg text-center">
                        <FiUsers className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <span className="text-sm font-medium">Manage Users</span>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Activity</h2>
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                        <p>No recent activity to display</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;