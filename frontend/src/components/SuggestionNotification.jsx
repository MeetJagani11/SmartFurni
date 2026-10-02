import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../apiConfig';
import { Sparkles, X, ChevronRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuggestionNotification = () => {
    const { user, token } = useAuth();
    const [suggestions, setSuggestions] = useState([]);
    const [currentSuggestion, setCurrentSuggestion] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !token) return;

        const fetchSuggestions = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/smart-suggestions/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.length > 0) {
                    setSuggestions(res.data);
                    setCurrentSuggestion(res.data[0]);
                    // Show with a slight delay
                    setTimeout(() => setIsVisible(true), 2000);
                }
            } catch (err) {
                console.error("Failed to fetch smart suggestions", err);
            }
        };

        fetchSuggestions();
    }, [user, token]);

    const handleClose = async () => {
        setIsVisible(false);
        if (currentSuggestion) {
            try {
                await axios.post(`${API_BASE_URL}/smart-suggestions/${currentSuggestion._id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error("Failed to mark suggestion as read", err);
            }
        }
    };

    const handleAction = () => {
        if (currentSuggestion?.product_id) {
            navigate(`/product/${currentSuggestion.product_id}`);
        }
        handleClose();
    };

    if (!isVisible || !currentSuggestion) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 duration-500">
            <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 p-4 w-80 md:w-96 overflow-hidden relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                <div className="relative bg-white rounded-xl">
                    <button
                        onClick={handleClose}
                        className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                            <Sparkles size={24} className="animate-pulse" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500">Smart Suggestion</span>
                                <div className="h-1 w-1 rounded-full bg-orange-300"></div>
                                <span className="text-[10px] text-gray-400">Just for you</span>
                            </div>

                            <p className="text-sm font-medium text-gray-800 leading-tight mb-3">
                                {currentSuggestion.message}
                            </p>

                            <button
                                onClick={handleAction}
                                className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors group/btn"
                            >
                                View Details
                                <ChevronRight size={14} className="transform group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuggestionNotification;
