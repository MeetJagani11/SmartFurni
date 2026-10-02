import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

const BestSelling = () => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/?best_selling=true&limit=12`);
        setBestSellingProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch best selling products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSelling();
  }, []);

  return (
    <div className="bg-white py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 md:mb-4">
          <span className="text-orange-600">Best Selling</span> Products
        </h2>
        <p className="text-center text-sm md:text-base text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto px-4">
          Explore our best-selling sofa sets and recliners, along with customer-approved beds and
          dining furniture, trusted for comfort, quality, and everyday use in modern homes.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 md:mt-12">
          <Link to="/products" className="inline-block bg-orange-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm md:text-base">
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BestSelling;