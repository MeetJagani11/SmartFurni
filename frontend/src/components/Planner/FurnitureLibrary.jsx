import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';
import { Search, Plus, Sofa, Bed, Table, Grid, Box } from 'lucide-react';
import { Input } from '../ui/input';
import { handleImageError } from '../../utils/imageFallback';

const FurnitureLibrary = ({ onSelectProduct }) => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    const categories = [
        { name: 'All', icon: <Grid size={14} /> },
        { name: 'Sofas', icon: <Sofa size={14} /> },
        { name: 'Beds', icon: <Bed size={14} /> },
        { name: 'Dining', icon: <Table size={14} /> },
        { name: 'Storage', icon: <Box size={14} /> }
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/products/?limit=1000`);
            const rawData = res.data || [];
            const uniqueProducts = Array.from(new Map(rawData.map(p => [p.id || p._id, p])).values());
            setProducts(uniqueProducts);
        } catch (err) {
            console.error("Failed to load library", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = products.filter(p => {
        const s = search.toLowerCase().trim();
        if (!s) return true;
        
        const name = p.name.toLowerCase();
        const cat = p.category.toLowerCase();
        
        // Define known strict categories
        const strictKeywords = ['sofa', 'bed', 'dining', 'recliner', 'table', 'chair', 'cabinet', 'storage'];
        const singularSearch = s.replace(/s$/, ''); // e.g. "sofas" -> "sofa"
        
        // If searching for a known category keyword, only show matching items
        if (strictKeywords.includes(singularSearch) || strictKeywords.includes(s)) {
            const keyword = strictKeywords.find(k => k === singularSearch || k === s);
            return name.includes(keyword) || cat.includes(keyword);
        }
        
        // Default broad matching for general queries
        return name.includes(s) || cat.includes(s);
    });

    const getDisplayCategory = (product) => {
        const name = product.name.toLowerCase();
        const cat = product.category.toLowerCase();
        
        if (name.includes('sofa') || cat.includes('sofa')) return 'SOFA';
        if (name.includes('bed') || cat.includes('bed')) return 'BEDROOM';
        if (name.includes('dining') || cat.includes('dining')) return 'DINING';
        if (name.includes('recliner') || cat.includes('recliner')) return 'RECLINER';
        if (name.includes('chair') || cat.includes('chair')) return 'CHAIR';
        if (name.includes('table') || cat.includes('table')) return 'TABLE';
        if (name.includes('cupboard') || name.includes('cabinet') || cat.includes('storage')) return 'STORAGE';
        
        return product.category.toUpperCase();
    };

    return (
        <div className="w-80 bg-white border-r flex flex-col h-full z-20 shadow-sm">
            <div className="p-4 border-b">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Grid size={18} className="text-orange-500" />
                    Furniture Library
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Search sofas, beds..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-orange-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-xl" />)}
                    </div>
                ) : filtered.map(product => (
                    <div
                        key={product.id}
                        className="group bg-gray-50 rounded-xl p-3 border border-transparent hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer flex gap-3"
                        onClick={() => onSelectProduct(product)}
                        draggable={true}
                        onDragStart={(e) => {
                            e.dataTransfer.setData("product", JSON.stringify(product));
                        }}
                    >
                        <div className="w-16 h-16 bg-white rounded-lg border overflow-hidden flex-shrink-0">
                            <img src={product.image} alt={product.name || ""} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">{product.name}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">
                                {getDisplayCategory(product)}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-orange-600">₹{(product.smartFurniPrice || product.price || 0).toLocaleString()}</span>
                                <div className="bg-orange-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FurnitureLibrary;
