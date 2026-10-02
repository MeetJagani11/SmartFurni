import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Package, Truck, CheckCircle, Clock, MapPin, ChevronDown, ChevronUp, RefreshCcw, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import OrderTracking from '../components/OrderTracking';

const Orders = () => {
    const { user, token, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const toggleTracking = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    const handleReturnRequest = async (orderId) => {
        const reason = window.prompt("Please enter the reason for your return:");
        if (reason === null) return; // User cancelled
        if (!reason.trim()) {
            toast({
                title: "Reason Required",
                description: "Please provide a reason for the return request.",
                variant: "destructive"
            });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/return?reason=${encodeURIComponent(reason)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const updatedOrder = await response.json();
                setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
                toast({
                    title: "Return Requested",
                    description: "Your return request has been submitted successfully.",
                });
            } else {
                let errorMessage = "Failed to submit return request.";
                try {
                    const error = await response.json();
                    errorMessage = error.detail || errorMessage;
                } catch (e) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                
                console.error("Return Request Failed:", errorMessage);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Fetch error requesting return:", error);
            toast({
                title: "Error",
                description: `Connection error: ${error.message || "Unknown error"}`,
                variant: "destructive"
            });
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const updatedOrder = await response.json();
                setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
                toast({
                    title: "Order Cancelled",
                    description: "Your order has been cancelled successfully.",
                });
            } else {
                let errorMessage = "Failed to cancel order.";
                try {
                    const error = await response.json();
                    errorMessage = error.detail || errorMessage;
                } catch (e) {}
                
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: `Connection error: ${error.message}`,
                variant: "destructive"
            });
        }
    };

    const isEligibleForReturn = (order) => {
        if (order.status !== 'delivered') return false;
        
        const deliveryDate = order.completedAt || order.created_at;
        const diffInDays = (new Date() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24);
        return diffInDays <= 7;
    };

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Sort descending by created_at
                    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setOrders(data);
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load orders.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast({
                    title: "Error",
                    description: "An unexpected error occurred.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate, token, toast]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Clock className="h-8 w-8 animate-spin text-orange-600" />
                    <p className="text-gray-500 font-medium">Fetching your orders...</p>
                </div>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'processing': return <Package className="h-5 w-5 text-blue-500" />;
            case 'shipped': return <Truck className="h-5 w-5 text-indigo-500" />;
            case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'return_requested': return <RefreshCcw className="h-5 w-5 text-orange-500" />;
            case 'returned': return <AlertCircle className="h-5 w-5 text-gray-500" />;
            default: return <Package className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <Button variant="outline" onClick={() => navigate('/profile')}>Back to Profile</Button>
                </div>

                {orders.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <Package className="h-16 w-16 text-gray-400 mb-4" />
                            <h2 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h2>
                            <p className="text-gray-500 mb-6">Looks like you haven't made any purchases yet.</p>
                            <Button onClick={() => navigate('/products')}>Start Shopping</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="bg-gray-50 border-b pb-4">
                                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                                            <CardDescription>Placed on {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(order.status)}
                                            <span className="font-medium capitalize">{order.status}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-medium">₹{(item.smartFurniPrice * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Shipping To</h4>
                                            <p className="text-sm font-semibold">{order.shippingAddress.name}</p>
                                            <p className="text-sm text-gray-600 italic">
                                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-3">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h4>
                                                <p className="text-xl font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                                            </div>
                                            <Button
                                                variant={expandedOrder === order.id ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleTracking(order.id)}
                                                className={expandedOrder === order.id ? "bg-orange-600 hover:bg-orange-700 text-white" : "border-orange-200 text-orange-600 hover:bg-orange-50"}
                                            >
                                                {expandedOrder === order.id ? (
                                                    <><ChevronUp className="mr-2 h-4 w-4" /> Hide Tracking</>
                                                ) : (
                                                    <><MapPin className="mr-2 h-4 w-4" /> Track Order</>
                                                )}
                                            </Button>
                                            {isEligibleForReturn(order) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleReturnRequest(order.id)}
                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                >
                                                    <RefreshCcw className="mr-2 h-4 w-4" /> Return Items
                                                </Button>
                                            )}
                                            {['pending', 'processing'].includes(order.status) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <AlertCircle className="mr-2 h-4 w-4" /> Cancel Order
                                                </Button>
                                            )}

                                        </div>
                                    </div>

                                    {/* Tracking View Expansion */}
                                    {expandedOrder === order.id && (
                                        <div className="mt-6 pt-6 border-t animate-in slide-in-from-top-4 duration-300">
                                            <OrderTracking status={order.status} history={order.trackingHistory} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
