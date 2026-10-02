import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useWishlist } from '../context/WishlistContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Heart, Loader2, ShoppingBag, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
    const { user, token, loading: authLoading } = useAuth();
    const { wishlistProductIds, toggleWishlist: removeFromFavorite, wishlistCount } = useWishlist();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlistProducts = React.useCallback(async () => {
        if (!wishlistProductIds.length) {
            setWishlistProducts([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const productPromises = wishlistProductIds.map(id =>
                axios.get(`${API_BASE_URL}/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => null)
            );
            const productResponses = await Promise.all(productPromises);
            const products = productResponses
                .filter(r => r && r.status === 200)
                .map(r => r.data);

            setWishlistProducts(products);
        } catch (error) {
            console.error("Wishlist error:", error);
            toast({ title: "Error", description: "Could not load wishlist details.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [wishlistProductIds, toast]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }
        fetchWishlistProducts();
    }, [user, authLoading, navigate, fetchWishlistProducts]);

    const removeFromWishlist = async (productId) => {
        await removeFromFavorite(productId);
    };

    if (authLoading || (loading && wishlistProducts.length === 0)) {
        return (
            <div className="min-h-screen flex flex-col mt-20 items-center">
                <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
                <p className="text-gray-500">Loading your favorites...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 md:py-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <Heart className="text-orange-600 fill-orange-600" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Wishlist</h1>
                            <p className="text-gray-500 mt-1">{wishlistCount} items saved to your favorites</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/products')}
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50 hidden md:flex items-center gap-2"
                    >
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </Button>
                </div>

                {wishlistProducts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                        <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Seems like you haven't added any furniture to your favorites yet.
                        </p>
                        <Button
                            onClick={() => navigate('/products')}
                            className="bg-orange-600 hover:bg-orange-700 h-12 px-8"
                        >
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlistProducts.map(product => (
                            <div key={product.id} className="relative group">
                                <ProductCard product={product} />
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-red-50 text-red-500 transition-all opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
                                    title="Remove from favorites"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Wishlist;
