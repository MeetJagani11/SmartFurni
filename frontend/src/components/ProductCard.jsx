import { Link } from 'react-router-dom';
import { Star, ShoppingCart, CheckCircle, AlertTriangle, Heart, Check } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

import { useWishlist } from '../context/WishlistContext';
import { handleImageError } from '../utils/imageFallback';

const ProductCard = ({ product, roomPrefs }) => {
  const { addToCart } = useCart();
  const { token } = useAuth();
  const { toggleWishlist: toggleWishlistGlobal, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    await toggleWishlistGlobal(product.id);
  };

  // Fit Validation Logic
  const checkFit = () => {
    if (!roomPrefs || !product.length || !product.width) return { fits: true, message: "" };

    const { length: rL, width: rW, height: rH } = roomPrefs;
    const { length: pL, width: pW, height: pH } = product;

    // Check floor area fit (simplistic - assumes item is smaller than room room)
    const fitsFloor = (pL <= rL && pW <= rW) || (pL <= rW && pW <= rL);
    const fitsHeight = !pH || !rH || pH <= rH;

    if (!fitsFloor) return { fits: false, message: "Too large for floor" };
    if (!fitsHeight) return { fits: false, message: "Too tall for ceiling" };

    return { fits: true, message: "Perfect Fit" };
  };

  const fitStatus = checkFit();

  const handleAddToCart = () => {
    if (!fitStatus.fits) {
      toast({
        title: "Size Warning",
        description: `Note: This ${product.name} might be too large for your ${roomPrefs?.room_type || 'room'}.`,
        variant: "destructive"
      });
    }
    addToCart(product);
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          onError={handleImageError}
          className="w-full h-48 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Fit Badge */}
        {roomPrefs && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 shadow-sm backdrop-blur-md ${fitStatus.fits
            ? 'bg-emerald-500/90 text-white'
            : 'bg-red-500/90 text-white'
            }`}>
            {fitStatus.fits ? <Check size={12} /> : <AlertTriangle size={12} />}
            {fitStatus.fits ? "FITS SPACE" : "OVERSIZED"}
          </div>
        )}

        {product.discount && (
          <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-red-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
            {product.discount}% OFF
          </div>
        )}

        {/* Fit Status Badge */}
        {fitStatus.message && (
          <div className={`absolute top-2 md:top-4 left-2 md:left-4 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 shadow-sm ${fitStatus.fits ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
            }`}>
            {fitStatus.fits ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
            {fitStatus.message}
          </div>
        )}

        {/* AI Match Score Badge */}
        {product.ai_match_score && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-orange-600/90 text-white text-[10px] md:text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm border border-orange-400/30">
            <Sparkles size={12} className="text-orange-200 animate-pulse" />
            {product.ai_match_score}% MATCH
          </div>
        )}

        {/* Stock Status Badge */}
        {product.stockStatus === 'out_of_stock' ? (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="bg-rose-600 text-white px-4 py-2 rounded-lg font-bold shadow-xl border border-rose-500/30 transform -rotate-3 uppercase tracking-wider">
              Out of Stock
            </div>
          </div>
        ) : product.stockStatus === 'few_available' && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] md:text-xs font-black flex items-center gap-1 shadow-lg border border-amber-400/30 z-10">
            <AlertTriangle size={10} />
            FEW LEFT!
          </div>
        )}
      </Link>

      {/* Wishlist Button - Outside Link to avoid navigation on click */}
      <button
        onClick={toggleWishlist}
        className={`absolute top-[160px] md:top-[210px] right-3 p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-90 z-10 ${isFavorite
          ? 'bg-orange-600 text-white'
          : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:text-orange-600'
          }`}
      >
        <Heart size={18} className={isFavorite ? 'fill-white' : ''} />
      </button>

      <div className="p-3 md:p-4">
        <Link to={`/product/${product.id}`} className="block mb-1 group-hover:text-orange-600 transition-colors">
          <h3 className="font-semibold text-sm md:text-lg line-clamp-2 h-10 md:h-14">
            {product.name}
          </h3>
        </Link>


        {product.rating && (
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-[10px] md:text-xs text-gray-500">({product.reviews} Reviews)</span>

            {/* Sustainability Score */}
            <div className="ml-auto flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded text-emerald-700">
              <span className="text-[10px] font-bold">ECO</span>
              <span className="text-xs font-bold">{product.sustainabilityScore || 5}/10</span>
            </div>
          </div>
        )}

        <div className="space-y-1 mb-3 md:mb-4">
          <div className="flex items-baseline gap-2 md:gap-3">
            <span className="text-xs md:text-sm text-gray-500">Market Price</span>
            <span className="text-xs md:text-sm text-gray-500 line-through">
              ₹ {product.marketPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-baseline gap-2 md:gap-3">
            <span className="text-xs md:text-sm font-medium text-gray-700">SmartFurni Price</span>
            <span className="text-lg md:text-2xl font-bold text-orange-600">
              ₹ {product.smartFurniPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stockStatus === 'out_of_stock'}
          className="w-full bg-orange-600 text-white py-2 md:py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} className="md:w-5 md:h-5" />
          {product.stockStatus === 'out_of_stock' ? 'Sold Out' : 'Add To Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;