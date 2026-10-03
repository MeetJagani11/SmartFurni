import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Star, ShoppingCart, Heart, Shield, Truck, 
    RefreshCcw, Ruler, CheckCircle, AlertTriangle, 
    ArrowLeft, Loader2, Sparkles, Share2, ChevronLeft, ChevronRight
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../apiConfig';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import ProductCard from '../components/ProductCard';
import { handleImageError } from '../utils/imageFallback';

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [roomPrefs, setRoomPrefs] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState(null);
    const scrollContainerRef = useRef(null);

    const isFavorite = product ? isInWishlist(product.id) : false;

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Fetch main product details
                const response = await fetch(`${API_BASE_URL}/products/${productId}`);
                if (!response.ok) throw new Error('Product not found');
                const data = await response.json();
                setProduct(data);

                // Log activity (view_product)
                const token = localStorage.getItem('token');
                if (token) {
                    fetch(`${API_BASE_URL}/activity_logs/`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({
                            action: 'view_product',
                            entity_id: productId
                        })
                    }).catch(err => console.error("Activity logging failed:", err));
                }

                // Fetch similar products (same category)
                const similarResponse = await fetch(`${API_BASE_URL}/products/?category=${data.category}&limit=5`);
                if (similarResponse.ok) {
                    const similarData = await similarResponse.json();
                    setSimilarProducts(similarData.filter(p => p.id !== productId));
                }

                // Fetch room preferences for fit check
                if (token) {
                    const prefResponse = await fetch(`${API_BASE_URL}/room_preferences/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (prefResponse.ok) {
                        const prefData = await prefResponse.json();
                        setRoomPrefs(prefData);
                    }
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                toast({
                    title: "Error",
                    description: "Could not load product details.",
                    variant: "destructive"
                });
                navigate('/');
            } finally {
                setLoading(false);
                window.scrollTo(0, 0);
            }
        };

        fetchProductData();
    }, [productId, navigate, toast]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product);
        toast({
            title: "Added to Cart!",
            description: `${product.name} has been added to your cart.`,
        });
    };
 
    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Check out this ${product.name} on SmartFurni!`,
            url: window.location.href,
        };
 
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast({
                    title: "Link Copied!",
                    description: "Product link has been copied to your clipboard.",
                });
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleCheckDelivery = () => {
        if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
            setDeliveryStatus({ error: "Please enter a valid 6-digit pincode" });
            return;
        }

        setDeliveryStatus({ loading: true });

        // Simulate API call
        setTimeout(() => {
            const isAvailable = true; // Most pincodes available in this mock
            if (isAvailable) {
                const days = Math.floor(Math.random() * 4) + 3; // 3-7 days
                const date = new Date();
                date.setDate(date.getDate() + days);
                const dateString = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                
                setDeliveryStatus({
                    available: true,
                    expectedDate: dateString,
                    isFast: days <= 4
                });
            } else {
                setDeliveryStatus({
                    available: false,
                    message: "Sorry, we don't deliver to this location yet."
                });
            }
        }, 800);
    };

    const scrollSimilar = (direction) => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollAmount = clientWidth * 0.8;
            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };
 
    const getSizeGuideContent = () => {
        const category = product.category.toLowerCase();
        if (category.includes('sofa') || category.includes('living')) {
            return (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Standard Sofa Dimensions Guide:</p>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border p-2 text-left">Type</th>
                                <th className="border p-2 text-left">Width</th>
                                <th className="border p-2 text-left">Depth</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td className="border p-2">3-Seater</td><td className="border p-2">180 - 220 cm</td><td className="border p-2">85 - 100 cm</td></tr>
                            <tr><td className="border p-2">2-Seater</td><td className="border p-2">140 - 170 cm</td><td className="border p-2">85 - 100 cm</td></tr>
                            <tr><td className="border p-2">L-Shape</td><td className="border p-2">240 - 300 cm</td><td className="border p-2">150 - 180 cm</td></tr>
                        </tbody>
                    </table>
                </div>
            );
        }
        if (category.includes('bed') || category.includes('bedroom')) {
            return (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Standard Bed Sizes:</p>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border p-2 text-left">Size</th>
                                <th className="border p-2 text-left">Width</th>
                                <th className="border p-2 text-left">Length</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td className="border p-2">King</td><td className="border p-2">180 cm (72")</td><td className="border p-2">200 cm (78")</td></tr>
                            <tr><td className="border p-2">Queen</td><td className="border p-2">150 cm (60")</td><td className="border p-2">200 cm (78")</td></tr>
                            <tr><td className="border p-2">Double</td><td className="border p-2">120 cm (48")</td><td className="border p-2">200 cm (78")</td></tr>
                        </tbody>
                    </table>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Standard Product Dimensions:</p>
                <div className="p-4 bg-orange-50 rounded-lg text-orange-800 text-sm">
                    <strong>Current Product:</strong> {product.length}m x {product.width}m x {product.height}m
                </div>
                <p className="text-xs text-gray-500 italic">*Measured at the widest/longest points.</p>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-600 mb-4" />
                    <p className="text-gray-500 font-medium">Loading product details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) return null;

    const allImages = [product.image, ...(product.images || [])];

    return (
        <div className="min-h-screen bg-white">
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
                    <span>/</span>
                    <Link to={`/category/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="hover:text-orange-600 transition-colors">
                        {product.category}
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group">
                            <img 
                                src={allImages[activeImage]} 
                                alt={product.name}
                                onError={handleImageError}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {product.discount && (
                                <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-1.5 rounded-full font-bold shadow-lg">
                                    {product.discount}% OFF
                                </div>
                            )}
                            <button 
                                onClick={() => toggleWishlist(product.id)}
                                className={`absolute top-4 left-4 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 ${
                                    isFavorite ? 'bg-orange-600 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-600'
                                }`}
                            >
                                <Heart size={20} className={isFavorite ? 'fill-white' : ''} />
                            </button>
                        </div>
                        
                        {allImages.length > 1 && (
                            <div className="grid grid-cols-5 gap-4">
                                {allImages.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                            activeImage === idx ? 'border-orange-600 ring-2 ring-orange-100' : 'border-transparent hover:border-gray-300'
                                        }`}
                                    >
                                        <img src={img} alt={product.name || ""} onError={handleImageError} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full uppercase tracking-wider">
                                    {product.category}
                                </span>
                                {product.stockStatus === 'in_stock' ? (
                                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                        <CheckCircle size={14} /> IN STOCK
                                    </span>
                                ) : product.stockStatus === 'few_available' ? (
                                    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                                        <AlertTriangle size={14} /> ONLY FEW LEFT!
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-600 text-xs font-bold">
                                        <AlertTriangle size={14} /> OUT OF STOCK
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-yellow-700">{product.rating}</span>
                                </div>
                                <span className="text-gray-500 text-sm font-medium underline cursor-pointer">
                                    {product.reviews} Customer Reviews
                                </span>
                                <div className="h-4 w-px bg-gray-200" />
                                <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">
                                    <Sparkles size={14} />
                                    ECO SCORE: {product.sustainabilityScore || 5}/10
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                            <div className="flex items-baseline gap-3 mb-1">
                                <span className="text-3xl md:text-4xl font-bold text-orange-600">
                                    ₹{product.smartFurniPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="text-lg text-gray-400 line-through">
                                    ₹{product.marketPrice.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <p className="text-emerald-600 text-sm font-bold mb-4">
                                You save ₹{(product.marketPrice - product.smartFurniPrice).toLocaleString('en-IN')} ({product.discount}% OFF)
                            </p>
                            <div className="text-xs text-gray-500 font-medium">Inclusive of all taxes</div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <button 
                                onClick={handleAddToCart}
                                disabled={product.stockStatus === 'out_of_stock'}
                                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <ShoppingCart size={22} />
                                Add To Cart
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={handleShare}
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Share2 size={18} /> Share
                                </button>
                                <button 
                                    onClick={() => setShowSizeGuide(true)}
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Ruler size={18} /> Size Guide
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <Truck size={20} />
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-gray-600">Free Delivery</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                    <Shield size={20} />
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-gray-600">5 Year Warranty</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                                    <RefreshCcw size={20} />
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-gray-600">Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                Product Description
                            </h2>
                            <div className="text-gray-600 leading-relaxed space-y-4">
                                {product.description ? (
                                    <p>{product.description}</p>
                                ) : (
                                    <p>Experience unparalleled comfort and style with the {product.name}. Carefully crafted from premium materials, this piece brings a touch of modern elegance to any home. Its durable construction ensures it remains a staple in your living space for years to come.</p>
                                )}
                                <p>Our furniture is designed with both ergonomics and aesthetics in mind, providing the perfect balance of support and visual appeal. Whether you're relaxing after a long day or entertaining guests, this piece offers the comfort you deserve.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                Specifications
                            </h2>
                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-sm text-left">
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 font-semibold text-gray-700 w-1/3">Dimensions</th>
                                            <td className="px-6 py-4 text-gray-600">
                                                {product.length}m (L) x {product.width}m (W) x {product.height}m (H)
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Material</th>
                                            <td className="px-6 py-4 text-gray-600">Premium Sheesham Wood & Fabric</td>
                                        </tr>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 font-semibold text-gray-700">Category</th>
                                            <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                        </tr>
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Color</th>
                                            <td className="px-6 py-4 text-gray-600">As shown in images</td>
                                        </tr>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 font-semibold text-gray-700">Warranty</th>
                                            <td className="px-6 py-4 text-gray-600">60 Months Manufacturers Warranty</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Sustainability Details */}
                        <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Sparkles size={20} />
                                    Eco-Friendly Choice
                                </h3>
                                <div className="text-4xl font-black mb-4">
                                    {product.sustainabilityScore || 5}/10
                                </div>
                                <p className="text-emerald-50 text-sm leading-relaxed mb-6">
                                    This product is part of our Green Initiative, using sustainably sourced wood and eco-friendly finishes.
                                </p>
                                <ul className="space-y-3 text-sm font-medium">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={14} className="text-emerald-300" /> Sustainably Sourced Wood
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={14} className="text-emerald-300" /> Low VOC Finishes
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={14} className="text-emerald-300" /> Recyclable Packaging
                                    </li>
                                </ul>
                            </div>
                            <div className="absolute -bottom-8 -right-8 opacity-20 transform rotate-12">
                                <Sparkles size={120} />
                            </div>
                        </div>

                        {/* Delivery Check */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Truck size={18} className="text-orange-600" />
                                Check Delivery
                            </h3>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Enter Pincode" 
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <button 
                                    onClick={handleCheckDelivery}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
                                >
                                    Check
                                </button>
                            </div>
                            
                            {deliveryStatus && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {deliveryStatus.loading ? (
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Loader2 size={12} className="animate-spin" /> Checking availability...
                                        </div>
                                    ) : deliveryStatus.error ? (
                                        <p className="text-xs text-red-500 font-medium">{deliveryStatus.error}</p>
                                    ) : deliveryStatus.available ? (
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                                                <CheckCircle size={14} /> 
                                                {deliveryStatus.isFast ? "Fast Delivery Available!" : "Standard Delivery Available"}
                                            </div>
                                            <p className="text-xs text-emerald-600">
                                                Expected by <span className="font-bold">{deliveryStatus.expectedDate}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-amber-600 font-medium">{deliveryStatus.message}</p>
                                    )}
                                </div>
                            )}
                            
                            {!deliveryStatus && (
                                <p className="text-[10px] text-gray-500 mt-2">Enter pincode to see estimated delivery dates</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <section className="pt-16 border-t border-gray-100">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Similar Products</h2>
                                <p className="text-gray-500">More of what you're looking for</p>
                            </div>
                            <Link to={`/category/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="text-orange-600 font-bold hover:underline">
                                View Collection
                            </Link>
                        </div>
                        <div className="relative group/carousel">
                            <div 
                                ref={scrollContainerRef}
                                className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
                            >
                                {similarProducts.map((p) => (
                                    <div key={p.id} className="min-w-[280px] sm:min-w-[300px] snap-start">
                                        <ProductCard product={p} roomPrefs={roomPrefs} />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Navigation Arrows */}
                            <button 
                                onClick={() => scrollSimilar('left')}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:text-orange-600 transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110 z-10"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={() => scrollSimilar('right')}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:text-orange-600 transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110 z-10"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
 
            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Ruler className="text-orange-600" /> Size Guide
                            </h3>
                            <button 
                                onClick={() => setShowSizeGuide(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {getSizeGuideContent()}
                        </div>
                        <div className="p-6 bg-gray-50 border-t">
                            <button 
                                onClick={() => setShowSizeGuide(false)}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                            >
                                Close Guide
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
