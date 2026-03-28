import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <p>Please login to view your profile</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="gradient-bg p-8 text-white">
                        <div className="flex items-center space-x-4">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=100&background=0ea5e9&color=fff`}
                                alt="Profile"
                                className="w-20 h-20 rounded-full border-4 border-white/30"
                            />
                            <div>
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                <p className="text-white/80">{user.email}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h3 className="font-semibold mb-2">Email</h3>
                                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h3 className="font-semibold mb-2">Language</h3>
                                <p className="text-gray-600 dark:text-gray-400 uppercase">{user.language || 'English'}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex space-x-4">
                            <button className="btn-primary">Edit Profile</button>
                            <button onClick={logout} className="btn-secondary text-red-500">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;