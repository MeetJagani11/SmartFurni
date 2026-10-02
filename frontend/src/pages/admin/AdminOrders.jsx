import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { PackageOpen } from 'lucide-react';

const AdminOrders = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    const fetchOrders = React.useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/orders/?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Sort by newest first
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setOrders(sorted);
        } catch (error) {
            toast({ title: 'Error fetching orders', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (user?.is_admin) fetchOrders();
    }, [user, fetchOrders]);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/admin/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({ title: `Order marked as ${newStatus}` });
            fetchOrders(); // Refresh table
        } catch (error) {
            toast({
                title: 'Error updating status',
                description: error.response?.data?.detail || error.message,
                variant: 'destructive'
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase">
                                <th className="p-4 font-semibold">Order ID</th>
                                <th className="p-4 font-semibold">Customer</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Total Amount</th>
                                <th className="p-4 font-semibold">Update Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading orders...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500">
                                        <PackageOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                        <p>No orders found in the system.</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-medium text-gray-900 max-w-[120px] truncate" title={order.id}>
                                                {order.id.split('-')[0]}...
                                            </p>
                                            <p className="text-xs text-gray-500">{order.items.length} items</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-gray-900">{order.shippingAddress.name}</p>
                                            <p className="text-xs text-gray-500">{order.shippingAddress.phone || order.userId}</p>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-semibold text-gray-900">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(order.status)} shrink-0`}>
                                                    {order.status}
                                                </span>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                                >
                                                    {validStatuses.map(s => (
                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
