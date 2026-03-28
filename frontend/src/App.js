import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import VoiceAssistant from './components/VoiceAssistant';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import Hotels from './pages/Hotels';
import Restaurants from './pages/Restaurants';
import Emergency from './pages/Emergency';
import PlaceDetail from './pages/PlaceDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import TripPlanner from './pages/TripPlanner';

function App() {
    const [isDark, setIsDark] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [command, setCommand] = useState(null);

    useEffect(() => {
        // Check for dark mode preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }

        // Get user location
        getUserLocation();
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDark;
        setIsDark(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');

        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Location error:', error.message);
                    // Default to Bhubaneswar
                    setUserLocation({ lat: 20.2961, lng: 85.8245 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    };

    const handleVoiceCommand = (cmd) => {
        setCommand(cmd);
        // Navigation will be handled by the component receiving this
    };

    return (
        <AuthProvider>
            <Router>
                <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
                    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                        <Navbar toggleDarkMode={toggleDarkMode} isDark={isDark} />

                        <Routes>
                            <Route path="/" element={<Home userLocation={userLocation} command={command} setCommand={setCommand} />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/explore" element={<Explore userLocation={userLocation} />} />
                            <Route path="/hotels" element={<Hotels userLocation={userLocation} />} />
                            <Route path="/restaurants" element={<Restaurants userLocation={userLocation} />} />
                            <Route path="/emergency" element={<Emergency userLocation={userLocation} />} />
                            <Route path="/place/:id" element={<PlaceDetail userLocation={userLocation} />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/trip-planner" element={<TripPlanner userLocation={userLocation} />} />
                        </Routes>

                        <VoiceAssistant onCommand={handleVoiceCommand} />
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;