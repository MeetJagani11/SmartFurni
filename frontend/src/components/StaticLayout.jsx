import React from 'react';
import Header from './Header';
import Footer from './Footer';

const StaticLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 text-gray-800">
          {title && (
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 border-b pb-4">
              {title}
            </h1>
          )}
          <div className="prose prose-orange max-w-none">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaticLayout;
