import React from 'react';
import { categories } from '../data/mockData';

const Categories = () => {
  return (
    <div id="shop-categories" className="bg-gray-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 md:mb-4">
          Shop by <span className="text-orange-600">Categories</span>
        </h2>
        <p className="text-center text-sm md:text-base text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto px-4">
          Buy premium sofa sets and recliner sofas, along with well-crafted furniture across beds,
          dining, study, and storage for modern homes.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {categories.map((category) => (
            <a
              key={category.id}
              href={category.link}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 md:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-3 md:p-4 text-center">
                <h3 className="font-bold text-sm md:text-lg text-gray-800 group-hover:text-orange-600 transition-colors">
                  {category.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;