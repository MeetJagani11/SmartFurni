import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { token, user } = useAuth();
    const { toast } = useToast();
    const [wishlistProductIds, setWishlistProductIds] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlistIds = useCallback(async () => {
        if (!token) {
            setWishlistProductIds([]);
            return;
        }
        try {
            const res = await axios.get(`${API_BASE_URL}/wishlists/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlistProductIds(res.data.product_ids || []);
        } catch (error) {
            console.error("Fetch wishlist error:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchWishlistIds();
    }, [fetchWishlistIds]);

    const toggleWishlist = async (productId) => {
        if (!token) {
            toast({ title: "Login Required", description: "Please login to manage your wishlist.", variant: "destructive" });
            return;
        }

        const isAdding = !wishlistProductIds.includes(productId);

        // Optimistic UI update
        setWishlistProductIds(prev =>
            isAdding ? [...prev, productId] : prev.filter(id => id !== productId)
        );

        try {
            if (isAdding) {
                await axios.post(`${API_BASE_URL}/wishlists/add/${productId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "Quick Save", description: "Added to your wishlist! 🧡" });
            } else {
                await axios.delete(`${API_BASE_URL}/wishlists/remove/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "Removed", description: "Product removed from wishlist." });
            }
        } catch (error) {
            // Revert on error
            setWishlistProductIds(prev =>
                isAdding ? prev.filter(id => id !== productId) : [...prev, productId]
            );
            toast({ title: "Error", description: "Could not update wishlist.", variant: "destructive" });
        }
    };

    const isInWishlist = (productId) => wishlistProductIds.includes(productId);

    return (
        <WishlistContext.Provider value={{
            wishlistProductIds,
            toggleWishlist,
            isInWishlist,
            refreshWishlist: fetchWishlistIds,
            wishlistCount: wishlistProductIds.length
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within WishlistProvider");
    return context;
};
