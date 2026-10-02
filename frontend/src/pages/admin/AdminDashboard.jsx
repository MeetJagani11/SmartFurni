import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { Users, Package, ShoppingCart, TrendingUp, Search, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });
    const [topSelling, setTopSelling] = useState([]);
    const [mostSearched, setMostSearched] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                // Fetch core stats
                const [usersRes, productsRes, ordersRes, analyticsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/admin/users/?limit=1000`, config),
                    axios.get(`${API_BASE_URL}/admin/products/?limit=1000`, config),
                    axios.get(`${API_BASE_URL}/admin/orders/?limit=1000`, config),
                    axios.get(`${API_BASE_URL}/admin/analytics/summary`, config)
                ]);

                const products = productsRes.data;
                const orders = ordersRes.data;
                const analytics = analyticsRes.data;

                // Calculate Revenue from all non-cancelled orders
                const validOrders = orders.filter(o => o.status !== 'cancelled');
                const revenue = validOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

                setStats({
                    totalUsers: usersRes.data.length,
                    totalProducts: products.length,
                    totalOrders: validOrders.length,
                    totalRevenue: revenue,
                });

                // Top Selling (From Backend)
                setTopSelling(analytics?.top_selling || []);

                // Most Searched (Most Viewed from Backend)
                const mostViewed = analytics?.most_viewed || [];
                const viewedWithDetails = await Promise.all(mostViewed.map(async (v) => {
                    const product = products.find(p => String(p.id) === String(v._id));
                    if (!product) return { id: v._id, views: v.count, name: "Loading...", smartFurniPrice: 0 };
                    return {
                        ...product,
                        id: v._id,
                        views: v.count
                    };
                }));
                
                setMostSearched(viewedWithDetails.filter(p => p && (p.name || p.id)));

            } catch (error) {
                console.error("ADMIN_DASHBOARD_ERROR:", error);
                toast({
                    title: "Dashboard Error",
                    description: error.response?.data?.detail || "Failed to load dashboard metrics.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        if (user && user.is_admin) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) {
        return <div className="flex h-64 items-center justify-center">Loading dashboard metrics...</div>;
    }

    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6 flex items-center min-w-0 h-full">
            <div className={`p-3 lg:p-4 rounded-full mr-3 lg:mr-4 flex-shrink-0 ${colorClass}`}>
                <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wider font-semibold truncate leading-tight mb-1">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-base lg:text-2xl font-bold text-gray-800 truncate" title={value}>{value}</h3>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-2">Welcome back, {user?.name}</p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    colorClass="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    colorClass="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    colorClass="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    colorClass="bg-green-100 text-green-600"
                />
            </div>

            {/* Product Lists Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                            Top Selling Products
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {topSelling.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border">
                                <div className="flex items-center space-x-4">
                                    <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">₹{product.smartFurniPrice.toLocaleString()}</p>
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium mt-1 inline-block">
                                        {product.salesVolume} Sold
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Most Searched */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <Search className="w-5 h-5 mr-2 text-blue-600" />
                            Most Searched Products
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {mostSearched.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border">
                                <div className="flex items-center space-x-4">
                                    <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{product.name}</p>
                                        <div className="flex items-center">
                                            <span className="text-xs text-yellow-500 mr-1">★ {product.rating || 0}</span>
                                            <span className="text-xs text-gray-500">({product.reviews || 0} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">₹{product.smartFurniPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
