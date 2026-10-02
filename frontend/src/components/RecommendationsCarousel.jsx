import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const RecommendationsCarousel = () => {
    const { user, token } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!user || !token) return;

        const fetchRecommendations = async () => {
            try {
                // Fetch up to 8 recommendations
                const response = await axios.get(`${API_BASE_URL}/recommendations/user/${user.id}?limit=8`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecommendations(response.data);
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user, token]);

    // Number of visible items dependent on screen size
    const [visibleCount, setVisibleCount] = useState(4);

    useEffect(() => {
        const updateVisibleCount = () => {
            if (window.innerWidth >= 1024) setVisibleCount(4);
            else if (window.innerWidth >= 768) setVisibleCount(3);
            else if (window.innerWidth >= 640) setVisibleCount(2);
            else setVisibleCount(1);
        };
        updateVisibleCount();
        window.addEventListener('resize', updateVisibleCount);
        return () => window.removeEventListener('resize', updateVisibleCount);
    }, []);

    const maxIndex = Math.max(0, recommendations.length - visibleCount);

    // Auto-advance carousel
    useEffect(() => {
        if (recommendations.length <= visibleCount) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [recommendations.length, maxIndex, visibleCount]);

    if (loading || recommendations.length === 0) {
        return null; // Don't show anything if loading or no recs available
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1 >= recommendations.length ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 < 0 ? recommendations.length - 1 : prev - 1));
    };


    return (
        <div className="mt-12 bg-orange-50/50 rounded-2xl p-6 sm:p-8 border border-orange-100">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                        <p className="text-gray-600 text-sm mt-1">Inspired by your past purchases and preferences</p>
                    </div>
                </div>

                {recommendations.length > visibleCount && (
                    <div className="hidden sm:flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full border-orange-200 text-orange-600 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-50"
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full border-orange-200 text-orange-600 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-50"
                            onClick={() => setCurrentIndex(prev => Math.min(maxIndex, prev + 1))}
                            disabled={currentIndex === maxIndex}
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </div>
                )}
            </div>

            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-out -mx-3"
                    style={{ 
                        transform: `translateX(-${currentIndex * (100 / (recommendations.length > visibleCount ? visibleCount : recommendations.length))}%)`
                    }}
                >
                    {recommendations.map((product) => (
                        <div
                            key={product.id}
                            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0 px-3"
                        >
                            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full border border-gray-100">
                                <ProductCard product={product} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile swipe indicator */}
            <div className="mt-6 flex justify-center sm:hidden gap-1.5">
                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-orange-200'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecommendationsCarousel;
