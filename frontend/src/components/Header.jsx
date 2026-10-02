import React, { useState } from 'react';
import { Search, ShoppingCart, User, MapPin, Phone, Menu, X, Sparkles, Layout, Heart } from 'lucide-react';
import { navCategories } from '../data/mockData';
import BookingModal from './BookingModal';
import CartDrawer from './CartDrawer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getCartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-800 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs md:text-sm">
          <div className="flex items-center gap-1 md:gap-2">
            <span className="font-semibold">Holi Special Sale</span>
            <span className="hidden sm:inline">Save up to 75%</span>
            <span className="mx-1 md:mx-2 hidden sm:inline">+</span>
            <span className="hidden md:inline">Additional Discounts :</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-1 md:ml-2 text-orange-400 hover:text-orange-300 underline"
            >
              Visit Store
            </button>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <a href="tel:+919723526763" className="flex items-center gap-1 md:gap-2 hover:text-orange-400">
              <Phone size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">+91 97235 26763</span>
            </a>
            <button
              onClick={() => navigate('/our-stores')}
              className="flex items-center gap-1 md:gap-2 hover:text-orange-400"
            >
              <MapPin size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">Our stores</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-orange-600"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center group cursor-pointer">
              <div className="text-xl md:text-2xl font-bold text-orange-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded flex items-center justify-center text-white text-lg md:text-xl group-hover:bg-orange-700 transition-colors">
                    S
                  </div>
                  <span className="group-hover:text-orange-700 transition-colors">SMARTFURNI</span>
                </div>
                <div className="text-[10px] md:text-xs text-gray-600 font-normal mt-1 hidden sm:block">
                  Sofas | Recliners | Beds | Dining & More
                </div>
              </div>
            </Link>

            {/* Search Bar - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/search?q=${e.target.value}`);
                    }
                  }}
                />
                <Search
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-orange-600"
                  size={20}
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling;
                    navigate(`/search?q=${input.value}`);
                  }}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-5">
              {/* AI Recommendations - Always flex on tablet/desktop for better visibility */}
              {user && (
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => navigate('/ai-recommendations')}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-white text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-lg transition-all border border-orange-200 shadow-sm font-medium"
                  >
                    <Sparkles size={16} className="text-orange-500" />
                    <span className="text-xs lg:text-sm">AI Recommendation</span>
                  </button>
                  <button
                    onClick={() => navigate('/room-planner')}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg transition-all border border-blue-200 shadow-sm font-medium"
                  >
                    <Layout size={16} className="text-blue-500" />
                    <span className="text-xs lg:text-sm">Room Planner</span>
                  </button>
                </div>
              )}

              {user ? (
                <div className="flex items-center gap-3 lg:gap-4">
                  <Link to="/profile" className="text-xs lg:text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
                    Hello, {user.name}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-orange-600 hover:text-orange-500"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="hidden md:flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white bg-gradient-to-tr from-orange-400 to-red-400 flex items-center justify-center shadow-md active:scale-95 transition-transform">
                    {user?.profile_picture ? (
                      <img
                        src={`${require('../apiConfig').API_BASE_URL.replace('/api', '')}${user.profile_picture}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-white drop-shadow-sm" />
                    )}
                  </div>
                  <span className="text-sm font-semibold hidden lg:inline tracking-tight">
                    {user ? "Account" : "Login / Register"}
                  </span>
                </button>
              )}
              <button
                onClick={() => !user && navigate('/login')}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-400 text-white shadow-sm"
              >
                <User size={18} />
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                className="relative text-gray-700 hover:text-orange-600 transition-colors"
              >
                <Heart size={20} className="md:w-6 md:h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={openCart}
                className="relative text-gray-700 hover:text-orange-600 transition-colors"
              >
                <ShoppingCart size={20} className="md:w-6 md:h-6" />
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
                  {getCartCount()}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/search?q=${e.target.value}`);
                  }
                }}
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                size={18}
                onClick={(e) => {
                  const input = e.currentTarget.previousSibling;
                  navigate(`/search?q=${input.value}`);
                }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center justify-center gap-8 py-3">
              {navCategories.map((category, index) => (
                <li key={index}>
                  <a
                    href={category.link}
                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden bg-white border-t border-gray-200">
            <ul className="px-4 py-3 space-y-3 border-b border-gray-100">
              {user && (
                <>
                  <li>
                    <Link
                      to="/ai-recommendations"
                      className="flex items-center gap-2 text-sm font-medium text-orange-600 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Sparkles size={16} />
                      AI Recommendation
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/room-planner"
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Layout size={16} />
                      Virtual Room Planner
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <ul className="px-4 py-3 space-y-3">
              {navCategories.map((category, index) => (
                <li key={index}>
                  <a
                    href={category.link}
                    className="block text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <CartDrawer />
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;