import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    const fetchUserProfile = useCallback(async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user profile", error);
            logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        // Check for existing token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // Ideally fetch full user profile here, but specific fields from token work for now
                    // We can also call /api/auth/me here
                    fetchUserProfile(token);
                }
            } catch (error) {
                console.error("Invalid token", error);
                logout();
            }
        } else {
            setLoading(false);
        }
    }, [logout, fetchUserProfile]);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            const data = response.data;
            localStorage.setItem('token', data.access_token);
            await fetchUserProfile(data.access_token);
            return true;
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || 'Login failed');
            }
            throw error;
        }
    };

    const register = async (name, email, password, phone) => {
        try {
            await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password, phone });
            // Auto login after register
            await login(email, password);
            return true;
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || 'Registration failed');
            }
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token: localStorage.getItem('token'), login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
