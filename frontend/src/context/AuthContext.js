import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get(`${API_URL}/auth/me`);
                    setUser(response.data.user);
                } catch (err) {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const register = async (name, email, password, phone) => {
        try {
            setError(null);
            const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const googleLogin = async (tokenId) => {
        try {
            setError(null);
            const response = await axios.post(`${API_URL}/auth/google`, { tokenId });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Google login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateProfile = async (data) => {
        try {
            const response = await axios.put(`${API_URL}/auth/profile`, data);
            setUser(response.data.user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message };
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;