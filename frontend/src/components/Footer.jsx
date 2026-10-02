import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { navCategories } from '../data/mockData';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-base md:text-lg mb-3 md:mb-4">SMARTFURNI</h3>
            <p className="text-xs md:text-sm mb-4">
              India's Trusted Premium Online Furniture Brand. Buy premium furniture online in India —
              sofa sets, recliners, wooden beds, fabric sofas, and dining sets.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-orange-400 transition-colors">
                <Facebook size={18} className="md:w-5 md:h-5" />
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                <Instagram size={18} className="md:w-5 md:h-5" />
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                <Twitter size={18} className="md:w-5 md:h-5" />
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                <Youtube size={18} className="md:w-5 md:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base md:text-lg mb-3 md:mb-4">Quick Links</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li>
                <Link to="/about-us" className="hover:text-orange-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/our-stores" className="hover:text-orange-400 transition-colors">
                  Our Stores
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="hover:text-orange-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-orange-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-orange-400 transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-orange-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-base md:text-lg mb-3 md:mb-4">Categories</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              {navCategories.map((category, index) => (
                <li key={index}>
                  <Link to={category.link} className="hover:text-orange-400 transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-base md:text-lg mb-3 md:mb-4">Contact Us</h3>
            <ul className="space-y-3 text-xs md:text-sm">
              <li className="flex items-start gap-2 md:gap-3">
                <Phone size={16} className="mt-1 flex-shrink-0 md:w-5 md:h-5" />
                <div>
                  <a href="tel:+919723526763" className="hover:text-orange-400 transition-colors">
                    +91 97235 26763
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Mail size={16} className="mt-1 flex-shrink-0 md:w-5 md:h-5" />
                <div>
                  <a
                    href="mailto:support@smartfurni.com"
                    className="hover:text-orange-400 transition-colors"
                  >
                    support@smartfurni.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <MapPin size={16} className="mt-1 flex-shrink-0 md:w-5 md:h-5" />
                <div>
                  <Link to="/our-stores" className="hover:text-orange-400 transition-colors">
                    12 Stores across Surat
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 md:pt-8 text-center text-xs md:text-sm">
          <p>&copy; 2025 SmartFurni. All rights reserved.</p>
          <p className="mt-2">www.smartfurni.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;