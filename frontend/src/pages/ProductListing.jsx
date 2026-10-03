import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const ProductListing = () => {
    const { categoryName } = useParams();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roomPrefs, setRoomPrefs] = useState(null);
    const { toast } = useToast();

    // Fetch room preferences if user is logged in
    useEffect(() => {
        const fetchRoomPrefs = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/room_preferences/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setRoomPrefs(data);
                }
            } catch (error) {
                console.error("Error fetching room preferences:", error);
            }
        };
        fetchRoomPrefs();
    }, []);

    // Helper functions for display text
    const getDisplayText = () => {
        if (searchQuery) return `Search Results for "${searchQuery}"`;
        if (categoryName) {
            const titleMap = {
                'reclaimed': 'Reclaimed & Distressed',
                'reclaimed-distressed': 'Reclaimed & Distressed',
                'study': 'Mattresses',
                'mattresses': 'Mattresses',
                'mattresses-collection': 'Mattresses',
                'grid-mattresses': 'Mattresses',
                'office': 'Study & Office',
                'study-office': 'Study & Office',
                'study-office-collection': 'Study & Office',
                'sofa-recliners': 'Sofa & Recliners',
                'living,sofa-recliners': 'Sofa & Recliners',
                'sofa-sets': 'Sofa Sets',
                'living': 'Living',
                'recliners': 'Recliners',
                'beds': 'Bedroom',
                'bedroom': 'Bedroom',
                'bedroom-collection': 'Bedroom',
                'storage': 'Storage',
                'storage-collection': 'Storage',
                'dining-sets': 'Dining',
                'dining': 'Dining',
                'home-temple': 'Home Temple',
                'home-temples': 'Home Temple'
            };
            return titleMap[categoryName.toLowerCase()] || categoryName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
        return 'All Products';
    };
 
    const getDescription = () => {
        if (searchQuery) return `Found ${products.length} matching products`;
 
        const descriptions = {
            'storage': "Explore Sheesham wood bedside tables and storage solutions, crafted for style and long-lasting durability.",
            'bedroom': "Transform your bedroom into a sanctuary with our premium beds, mattresses, and storage solutions.",
            'living': "Discover our special collection of Sofa Cum Beds and Shoe Racks for your living space.",
            'sofa-sets': "Explore our premium collection of luxury sofa sets, designed for comfort and elegance.",
            'recliners': "Experience the ultimate comfort with our premium range of manual and power recliners.",
            'dining-sets': "Explore our premium collection of well-crafted dining sets for your home.",
            'dining': "Elevate your dining experience with our elegant dining sets, chairs, and coffee tables.",
            'office': "Professional furniture for your study and office spaces, designed for productivity.",
            'study-office': "Professional furniture for your study and office spaces, designed for productivity.",
            'study': "High-quality mattresses designed for ultimate comfort and a restful night's sleep.",
            'mattresses': "High-quality mattresses designed for ultimate comfort and a restful night's sleep.",
            'reclaimed': "Unique furniture pieces crafted from reclaimed and distressed wood, blending history with modern design.",
            'reclaimed-distressed': "Unique furniture pieces crafted from reclaimed and distressed wood, blending history with modern design.",
            'living,sofa-recliners': "Explore our premium range of luxury sofas and comfortable recliners for your living space.",
            'beds': "Transform your bedroom into a sanctuary with our premium beds, mattresses, and storage solutions.",
            'home-temple': "Beautifully crafted home temples to create a peaceful space for prayer and reflection.",
            'home-temples': "Beautifully crafted home temples to create a peaceful space for prayer and reflection."
        };
        return descriptions[categoryName?.toLowerCase()] || `Explore our extensive collection of products.`;
    };
 
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `${API_BASE_URL}/products/`;
                const params = new URLSearchParams();
                params.append('limit', '1000');
 
                if (categoryName) {
                    // Map frontend categories to backend categories if needed
                    // For now sending the raw category param, backend can handle mapping or we map here
                    // The backend handles "category" query param.
                    // Frontend category mapping logic from previous version might be needed if backend expects specific values.
 
                    const categoryMap = {
                        'living': 'Sofa Sets', // Initial map, backend needs to support multiple or we fetch all and filter client side?
                        // Better to rely on backend search/filter. 
                        // Let's send the categoryName and let backend handle it, or fetch all and filter if backend is simple.
                        // Given backend implementation: query["category"] = category
                        // We might need to map 'living' -> 'Living' or similar. 
                        // Let's try sending it directly first or use the search param for flexibility if backend supports partial match on category?
                        // Actually backend `get_products` has specific category filter.
 
                        // Re-using the mapping logic from before but sending as category param might be tricky if one frontend category maps to multiple backend categories (e.g. Living -> Sofas, Recliners)
                        // For this iteration, let's fetch all and filter client-side to maintain the extensive mapping logic, OR update backend to support 'group' categories.
                        // Client-side filtering is safer to preserve existing behavior without changing backend logic too much.
                        'sofa-recliners': 'Sofa Sets', // Just an example
                    };
 
                    // If we want to maintain the exact same behavior as the mock version, client-side filtering after fetching all might be easiest for now,
                    // BUT that's inefficient. 
                    // Let's try to trust the backend search/filter if we can.
                    // The user wants SEARCH. 
 
                }
 
                if (searchQuery) {
                    params.append('search', searchQuery);
                    
                    // Log search activity
                    const token = localStorage.getItem('token');
                    if (token) {
                        fetch(`${API_BASE_URL}/activity_logs/`, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify({
                                action: 'search',
                                metadata: { query: searchQuery }
                            })
                        }).catch(err => console.error("Search activity logging failed:", err));
                    }
                } else if (categoryName) {
                    if (categoryName.toLowerCase() === 'new-launch') {
                        params.append('new_launch', 'true');
                    } else {
                        const categoryBackendMap = {
                            // Navbar mappings (Pure)
                            'sofa-recliners': 'Living,Recliners',
                            'living': 'Sofa Cum Bed,Shoe Racks',
                            'bedroom': 'Bedroom',
                            'storage': 'Storage',
                            'dining': 'Dining,Dining Chairs,Coffee Tables',
                            'reclaimed-distressed': 'Reclaimed & Distressed',
                            'mattresses': 'Mattresses',
                            'study-office': 'Study & Office',
                            'home-temple': 'Home Temple',
 
                            // Grid mappings (Inclusive)
                            'sofa-sets': 'Living,Exclusive Design 9',
                            'recliners': 'Recliners,Sofa & Recliners,Exclusive Design 10',
                            'bedroom-collection': 'Bedroom,Exclusive Design 1',
                            'dining-sets': 'Dining,Exclusive Design 2',
                            'storage-collection': 'Storage,Exclusive Design 3',
                            'study-office-collection': 'Study & Office,Exclusive Design 4',
                            'shoe-racks': 'Shoe Racks,Exclusive Design 5',
                            'sofa-cum-bed': 'Sofa Cum Bed,Exclusive Design 6',
                            'home-temples': 'Home Temple,Reclaimed & Distressed,Exclusive Design 8',
                            'mattresses-collection': 'Mattresses,Exclusive Design 7',
                            'dining-chairs': 'Dining Chairs',
                            'coffee-tables': 'Coffee Tables'
                        };
                        
                        const backendCategory = categoryBackendMap[categoryName.toLowerCase()] || 
                            categoryName.split('-')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');

                        params.append('category', backendCategory);
                    }
                }

                const queryString = params.toString();
                if (queryString) {
                    url += `?${queryString}`;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch products');

                const data = await response.json();

                // Deduplicate items safely by unique id
                const uniqueProducts = Array.isArray(data)
                    ? Array.from(new Map(data.map(p => [p.id || p._id, p])).values())
                    : [];
                setProducts(uniqueProducts);

            } catch (error) {
                console.error("Error fetching products:", error);
                toast({
                    title: "Error",
                    description: "Failed to load products. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryName, searchQuery, toast]);

    const displayText = getDisplayText();
    const description = getDescription();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    <p className="text-gray-500">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumb / Back Navigation */}
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                    <Link to="/" className="hover:text-orange-600 flex items-center gap-1">
                        <ArrowLeft size={16} />
                        Home
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-gray-900">{displayText}</span>
                </div>

                {/* Header */}
                <div className="mb-8 text-center pt-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayText}</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-4">{description}</p>
                    {/* Only show count if not already shown in description */}
                    {!searchQuery && (
                        <p className="text-sm text-gray-500">
                            {products.length} {products.length === 1 ? 'product' : 'products'} found
                        </p>
                    )}
                </div>

                {/* Product Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} roomPrefs={roomPrefs} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">
                            We couldn't find any products matching your criteria.
                        </p>
                        <Link
                            to="/"
                            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductListing;
