import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import ProductCard from './ProductCard';
import { Sparkles, Loader2 } from 'lucide-react';

const SimilarProducts = ({ productId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) return;

        const fetchSimilar = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/recommendations/product/${productId}?limit=4`);
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch similar products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilar();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="mt-16 border-t pt-10">
            <div className="flex items-center gap-2 mb-6 text-gray-900">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h3 className="text-xl font-bold">Similar Products You Might Like</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default SimilarProducts;
