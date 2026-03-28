import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiCompass, FiStar } from 'react-icons/fi';
import { aiAPI } from '../utils/api';

const TripPlanner = ({ userLocation }) => {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');

    const [budgetType, setBudgetType] = useState('medium');
    const [days, setDays] = useState(3);
    const [travelers, setTravelers] = useState(1);
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState(type === 'budget' ? 'budget' : 'planner');

    const interestOptions = [
        'temples', 'nature', 'shopping', 'history', 'food', 'culture'
    ];

    const handlePlanTrip = async () => {
        try {
            setLoading(true);
            const res = await aiAPI.planTrip({
                budget: budgetType,
                days,
                interests,
                travelers,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                lat: userLocation?.lat,
                lng: userLocation?.lng
            });
            setResult(res.data.data);
        } catch (error) {
            console.error('Error planning trip:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateBudget = async () => {
        try {
            setLoading(true);
            const res = await aiAPI.calculateBudget({
                days,
                travelers,
                hotelCategory: budgetType,
                foodStyle: 'medium',
                transportMode: 'cab'
            });
            setResult(res.data.data);
        } catch (error) {
            console.error('Error calculating budget:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12">
            <div className="max-w-4xl mx-auto px-3 sm:px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800 dark:text-white">
                    🤖 AI Trip Planner
                </h1>

                {/* Tabs */}
                <div className="flex justify-center mb-6 sm:mb-8">
                    <div className="flex space-x-1 sm:space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
                        <button
                            onClick={() => setActiveTab('planner')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'planner' ? 'bg-primary-500 text-white' : ''}`}
                        >
                            <FiCalendar className="inline mr-2" />
                            Plan Trip
                        </button>
                        <button
                            onClick={() => setActiveTab('budget')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'budget' ? 'bg-primary-500 text-white' : ''}`}
                        >
                            <FiDollarSign className="inline mr-2" />
                            Budget
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* Input Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Configure Your Trip</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Budget Level</label>
                                <select
                                    value={budgetType}
                                    onChange={(e) => setBudgetType(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="low">💰 Budget (₹800-1500/day)</option>
                                    <option value="medium">💼 Standard (₹2000-4000/day)</option>
                                    <option value="high">💎 Luxury (₹5000+/day)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Number of Days</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={days}
                                        onChange={(e) => setDays(parseInt(e.target.value))}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Travelers</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={travelers}
                                        onChange={(e) => setTravelers(parseInt(e.target.value))}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {activeTab === 'planner' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Your Interests</label>
                                    <div className="flex flex-wrap gap-2">
                                        {interestOptions.map((interest) => (
                                            <button
                                                key={interest}
                                                onClick={() => setInterests(prev =>
                                                    prev.includes(interest)
                                                        ? prev.filter(i => i !== interest)
                                                        : [...prev, interest]
                                                )}
                                                className={`px-3 py-1 rounded-full text-sm ${interests.includes(interest)
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700'
                                                    }`}
                                            >
                                                {interest === 'temples' ? '🛕' :
                                                    interest === 'nature' ? '🌳' :
                                                        interest === 'shopping' ? '🛍️' :
                                                            interest === 'history' ? '📜' :
                                                                interest === 'food' ? '🍽️' : '🎭'} {interest}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={activeTab === 'planner' ? handlePlanTrip : handleCalculateBudget}
                                disabled={loading}
                                className="w-full btn-primary py-3 mt-4"
                            >
                                {loading ? 'Processing...' : activeTab === 'planner' ? 'Generate Itinerary' : 'Calculate Budget'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                            {activeTab === 'planner' ? '📋 Your Itinerary' : '💰 Budget Breakdown'}
                        </h2>

                        {result ? (
                            <div className="space-y-4">
                                {activeTab === 'planner' && result.itinerary ? (
                                    result.itinerary.slice(0, 3).map((day, index) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <h3 className="font-semibold mb-2">Day {day.day}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {day.activities?.slice(0, 2).map(a => a.placeName).join(' → ')}
                                            </p>
                                        </div>
                                    ))
                                ) : result.breakdown ? (
                                    <>
                                        {Object.entries(result.breakdown).map(([key, value]) => (
                                            <div key={key} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <span className="capitalize">{key}</span>
                                                <span className="font-semibold text-primary-500">₹{value.total}</span>
                                            </div>
                                        ))}
                                        <div className="p-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total Budget</span>
                                                <span>₹{result.totals.total}</span>
                                            </div>
                                            <div className="text-sm text-white/80 mt-1">
                                                ₹{Math.round(result.totals.perPerson)} per person
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500">No results available</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 sm:py-12 text-gray-500">
                                <p className="text-sm sm:text-base">Configure your trip and click the button</p>
                                <p className="text-xs sm:text-sm mt-2">to get AI-powered recommendations</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripPlanner;