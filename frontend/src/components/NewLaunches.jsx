import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

const NewLaunches = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewLaunches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/?sort_by=newest&limit=8`);
        setNewProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch new launches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewLaunches();
  }, []);

  return (
    <div className="bg-gray-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 md:mb-4">
          <span className="text-orange-600">New</span> Launches
        </h2>
        <p className="text-center text-sm md:text-base text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto px-4">
          Explore our latest collection of Sofas, Beds, and Dining Sets, crafted to bring timeless
          elegance and comfort to your home. Perfect for everyday living and family gatherings.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewLaunches;