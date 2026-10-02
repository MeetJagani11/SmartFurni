import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import ProductCard from '../components/ProductCard';
import { Sparkles, ArrowLeft, Loader2, Info, Home, Wallet, Ruler, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const AIRecommendations = () => {
    const { user, token, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [roomPrefs, setRoomPrefs] = useState({
        length: 5,
        width: 5,
        room_type: 'Living Room'
    });
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const [inputs, setInputs] = useState({
        room_type: '',
        room_size: '',
        budget: '',
        style: ''
    });

    useEffect(() => {
        if (authLoading) return;

        if (!user || !token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Categories for the dropdown
                const catRes = await axios.get(`${API_BASE_URL}/categories/`);
                setCategories(catRes.data);

                // 2. Fetch initial personalized recommendations
                const response = await axios.get(`${API_BASE_URL}/recommendations/user/${user.id}?limit=16`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecommendations(response.data);

                // 3. Fetch Room Preferences
                try {
                    const prefRes = await axios.get(`${API_BASE_URL}/room_preferences/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setRoomPrefs(prefRes.data);
                } catch (prefErr) {
                    if (prefErr.response?.status !== 404) {
                        console.error("Room preference fetch failed:", prefErr);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Something went wrong. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, token, navigate]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            setGenerating(true);
            setError('');

            const response = await axios.post(`${API_BASE_URL}/recommendations/generate`, inputs, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setRecommendations(response.data);

            // Sync roomPrefs for the ProductCard fit logic (Calculating approx L/W from sq ft)
            const roomDim = Math.sqrt(parseFloat(inputs.room_size || 250) / 10.76);
            setRoomPrefs({
                length: roomDim,
                width: roomDim,
                room_type: inputs.room_type || 'Selected Room'
            });

            if (response.data.length === 0) {
                setError("No items found matching your specific criteria. Try broadening your search!");
            }
        } catch (err) {
            console.error("Engine failed:", err);
            setError("The recommendation engine encountered an error. Please try different inputs.");
        } finally {
            setGenerating(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    <p className="text-gray-500 font-medium">Personalizing assistant...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm text-gray-500 hover:text-orange-600 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Shop
                    </button>
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-orange-500" />
                        <span className="font-semibold text-gray-800">AI Design Assistant</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-8">
                {/* Hero Section */}
                <div className="mb-12 bg-gradient-to-br from-orange-600 via-orange-500 to-rose-500 rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-medium animate-in fade-in slide-in-from-left duration-700">
                            <Sparkles size={14} className="text-orange-200" />
                            Next-Generation AI Assistance
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                            Find your <span className="text-orange-200">perfect</span> match.
                        </h1>
                        <p className="text-orange-50 text-xl opacity-90 leading-relaxed max-w-xl">
                            Specify your room details and our AI will curate a selection of furniture
                            that fits your space, budget, and style perfectly.
                        </p>
                    </div>
                    {/* Abstract background blobs */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] group-hover:bg-white/15 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-orange-400/30 rounded-full blur-[80px] group-hover:bg-orange-400/40 transition-all duration-700"></div>

                    {/* Animated accent circle */}
                    <div className="absolute top-1/4 left-3/4 w-4 h-4 bg-orange-200 rounded-full blur-sm animate-pulse"></div>
                </div>

                {/* Input Form Card - Premium Glassmorphism */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 p-8 md:p-10 mb-12 -mt-20 relative z-20">
                    <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
                        <div className="space-y-3">
                            <Label className="text-gray-600 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <Home size={14} className="text-orange-500" />
                                Room Type
                            </Label>
                            <Select
                                value={inputs.room_type}
                                onValueChange={(val) => setInputs({ ...inputs, room_type: val })}
                            >
                                <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:ring-orange-500 rounded-xl transition-all hover:bg-white">
                                    <SelectValue placeholder="Select room" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name} className="focus:bg-orange-50 focus:text-orange-700">{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-gray-600 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <Ruler size={14} className="text-orange-500" />
                                Room Size (sq ft)
                            </Label>
                            <Input
                                type="number"
                                placeholder="e.g. 250"
                                value={inputs.room_size}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || parseInt(val) > 0) {
                                        setInputs({ ...inputs, room_size: val });
                                    }
                                }}
                                min="1"
                                className="h-12 bg-white/50 border-gray-200 focus-visible:ring-orange-500 rounded-xl transition-all hover:bg-white"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-gray-600 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <Wallet size={14} className="text-orange-500" />
                                Max Budget (₹)
                            </Label>
                            <Input
                                type="number"
                                placeholder="e.g. 50000"
                                value={inputs.budget}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || parseInt(val) > 0) {
                                        setInputs({ ...inputs, budget: val });
                                    }
                                }}
                                min="1"
                                className="h-12 bg-white/50 border-gray-200 focus-visible:ring-orange-500 rounded-xl transition-all hover:bg-white"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-gray-600 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <Search size={14} className="text-orange-500" />
                                Style Preference
                            </Label>
                            <Input
                                placeholder="e.g. Modern, Minimal, Classic"
                                value={inputs.style}
                                onChange={(e) => setInputs({ ...inputs, style: e.target.value })}
                                className="h-12 bg-white/50 border-gray-200 focus-visible:ring-orange-500 rounded-xl transition-all hover:bg-white"
                            />
                        </div>

                        <div className="lg:col-span-4 mt-4">
                            <Button
                                type="submit"
                                className="w-full h-14 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white text-lg font-bold rounded-2xl gap-3 transition-all duration-300 shadow-[0_10px_30px_rgba(234,88,12,0.3)] hover:shadow-[0_15px_40px_rgba(234,88,12,0.4)] active:scale-[0.99] disabled:opacity-70"
                                disabled={generating}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        <span>Analyzing Style Geometry...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={24} className="animate-pulse" />
                                        <span>Generate AI Masterpiece</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Results Section */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {generating ? "AI is thinking..." : recommendations.length === 0 ? "No Matches" : "Top Personalized Matches"}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {recommendations.length > 0 ? `Showing ${recommendations.length} items curated by AI` : "Adjust your filters to see recommendations"}
                            </p>
                        </div>
                        {recommendations.length > 0 && (
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 text-orange-700 px-4 py-2 rounded-full border border-orange-100 font-medium text-sm">
                                    <Sparkles size={14} className="animate-pulse" />
                                    AI High-Confidence Results
                                </div>
                                <div className="text-xs text-gray-400 font-medium">
                                    Sorted by Match %
                                </div>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="bg-gray-100 animate-pulse aspect-[3/4] rounded-2xl"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-white border rounded-3xl p-12 text-center shadow-sm">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Info className="text-orange-500" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Notice</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-8">{error}</p>
                            <Button variant="outline" onClick={() => window.location.reload()}>Refresh Page</Button>
                        </div>
                    ) : recommendations.length === 0 ? (
                        <div className="bg-white border-2 border-dashed rounded-3xl p-16 text-center">
                            <Home className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900">Ready to start</h3>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                                Enter your room details above and let our AI designer find the perfect pieces for you.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {recommendations.map((product, idx) => (
                                <div 
                                    key={product.id} 
                                    className="animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both"
                                    style={{ animationDelay: `${idx * 150}ms` }}
                                >
                                    <ProductCard product={product} roomPrefs={roomPrefs} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIRecommendations;
