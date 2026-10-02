import React from 'react';

const HeroSection = () => {
  return (
    <div className="bg-gray-50">
      {/* Main Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Large Banner */}
          <div className="md:col-span-2 relative rounded-lg overflow-hidden shadow-lg group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=500&fit=crop"
              alt="Holi Special Sale"
              className="w-full h-[300px] md:h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-6 md:px-12">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">
                Holi Special <span className="text-orange-400">Sale</span>
              </h1>
              <p className="text-xl md:text-2xl text-white mb-4 md:mb-6">SAVE UPTO 75%</p>
              <button 
                onClick={() => document.getElementById('shop-categories')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-orange-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors w-fit text-sm md:text-base"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Side Banners */}
          <div className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=300&fit=crop"
              alt="Electric Recliners"
              className="w-full h-[200px] md:h-[250px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-white">Recliners</h3>
              <p className="text-white text-xs md:text-sm mt-1">Comfort That Brings Peace</p>
              <p className="text-orange-400 font-semibold mt-2 text-sm md:text-base">Starting From ₹36,990*</p>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=300&fit=crop"
              alt="6 Seater Dining Sets"
              className="w-full h-[200px] md:h-[250px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-white">Dining Table</h3>
              <p className="text-white text-xs md:text-sm mt-1">A Table That Brings Everyone Closer</p>
              <p className="text-orange-400 font-semibold mt-2 text-sm md:text-base">Starting From ₹17,990*</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;