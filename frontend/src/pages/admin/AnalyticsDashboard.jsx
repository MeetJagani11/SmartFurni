import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Eye, Search, UserCheck, Heart, TrendingUp, Users, DollarSign, Wallet, IndianRupee } from 'lucide-react';

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/admin/analytics/summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setData(response.data);
            } catch (err) {
                console.error("Error fetching analytics", err);
                setError("Failed to load analytics data");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center bg-white shadow rounded-lg">Loading Analytics...</div>;
    if (error) return <div className="p-8 text-center text-red-600 bg-white shadow rounded-lg">{error}</div>;

    const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const StatCard = ({ title, value, icon: Icon, color, isCurrency }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-lg mr-4 ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">
                    {isCurrency ? formatCurrency(value) : value}
                </h3>
            </div>
        </div>
    );

    const revenueMetrics = data?.revenue_metrics || { weekly: 0, monthly: 0, yearly: 0 };
    const revenueTrends = data?.revenue_trends || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Analytics Insights</h1>
                <div className="flex space-x-2">
                    <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" /> Live Activity Tracking
                    </div>
                </div>
            </div>

            {/* Revenue Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Weekly Revenue" 
                    value={revenueMetrics.weekly} 
                    icon={Wallet} 
                    color="bg-emerald-500" 
                    isCurrency={true} 
                />
                <StatCard 
                    title="Monthly Revenue" 
                    value={revenueMetrics.monthly} 
                    icon={IndianRupee} 
                    color="bg-teal-500" 
                    isCurrency={true} 
                />
                <StatCard 
                    title="Yearly Revenue" 
                    value={revenueMetrics.yearly} 
                    icon={DollarSign} 
                    color="bg-cyan-500" 
                    isCurrency={true} 
                />
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Top Viewed" value={data?.most_viewed?.[0]?.count || 0} icon={Eye} color="bg-blue-500" />
                <StatCard title="Top Searches" value={data?.top_searches?.[0]?.count || 0} icon={Search} color="bg-purple-500" />
                <StatCard title="Active Users" value={data?.login_activity?.reduce((acc, curr) => acc + curr.count, 0) || 0} icon={Users} color="bg-orange-500" />
                <StatCard title="Wishlist Hits" value={data?.wishlist_activity?.length || 0} icon={Heart} color="bg-red-500" />
            </div>

            {/* Revenue Trends Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" /> Revenue Trends (Last 30 Days)
                </h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueTrends}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} />
                            <Tooltip
                                formatter={(value) => [formatCurrency(value), 'Revenue']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Activity Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-orange-500" /> User Login Activity (Last 7 Days)
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.login_activity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ r: 6, fill: '#f97316' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Most Viewed Products */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-blue-500" /> Most Viewed Products
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.most_viewed} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Search Terms */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <Search className="w-5 h-5 mr-2 text-purple-500" /> Top Search Keywords
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.top_searches}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="_id"
                                    label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {data.top_searches.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Wishlist Popularity */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-red-500" /> Wishlist Trends
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-100">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name</th>
                                    <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Wishlist Count</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.wishlist_activity.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 text-sm font-medium text-gray-700">{item.name}</td>
                                        <td className="py-4 text-sm text-gray-600 text-right font-bold">{item.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
