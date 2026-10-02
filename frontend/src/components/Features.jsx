import React from 'react';
import { Truck, RefreshCw, Award, Shield } from 'lucide-react';
import { features } from '../data/mockData';

const iconMap = {
  Truck,
  RefreshCw,
  Award,
  Shield
};

const Features = () => {
  return (
    <div className="bg-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <div key={feature.id} className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:bg-orange-200 transition-colors">
                  <Icon className="text-orange-600" size={24} />
                </div>
                <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Features;