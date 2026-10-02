import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, CreditCard, Banknote, Truck, Trash2, ShieldCheck, Check, BadgeCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from '../hooks/use-toast';

const Checkout = () => {
    const { cart, getCartTotal, clearCart, removeFromCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState('');
    const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
    const [isUpiVerified, setIsUpiVerified] = useState(false);
    const [selectedBank, setSelectedBank] = useState('');
    useEffect(() => {
        if (!authLoading && !user) {
            toast({
                title: "Authentication Required",
                description: "Please login to proceed with checkout.",
                variant: "destructive"
            });
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Address State
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        name: 'John Doe',
        street: '123, Green Park Residency, 4th Block',
        city: 'Bengaluru',
        pincode: '560034',
        state: 'Karnataka, India',
        phone: '+91 98765 43210'
    });

    // Update address when user data is loaded
    useEffect(() => {
        if (user) {
            if (user.shipping_address) {
                setShippingAddress(user.shipping_address);
            } else {
                const savedAddress = localStorage.getItem(`shippingAddress_${user.id}`);
                if (savedAddress) {
                    try {
                        setShippingAddress(JSON.parse(savedAddress));
                    } catch (e) {
                        console.error("Failed to parse saved shipping address");
                    }
                } else {
                    // Reset to default if no user-specific address is found
                    setShippingAddress({
                        name: user.name || 'John Doe',
                        street: '123, Green Park Residency, 4th Block',
                        city: 'Bengaluru',
                        pincode: '560034',
                        state: 'Karnataka, India',
                        phone: user.phone || '+91 98765 43210'
                    });
                }
            }
        }
    }, [user]);

    const [tempAddress, setTempAddress] = useState(shippingAddress);

    // Sync tempAddress when shippingAddress changes (e.g. after loading from user)
    useEffect(() => {
        setTempAddress(shippingAddress);
    }, [shippingAddress]);

    // Card State
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        // Basic validation/formatting could go here
        setCardDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setTempAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditAddress = () => {
        setTempAddress(shippingAddress);
        setIsEditingAddress(true);
    };

    const handleSaveAddress = async () => {
        setShippingAddress(tempAddress);
        if (user?.id) {
            localStorage.setItem(`shippingAddress_${user.id}`, JSON.stringify(tempAddress));
        }
        
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.put(`${API_BASE_URL}/user-profile/`, {
                    shipping_address: tempAddress
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error("Failed to save address to profile:", error);
            // We don't block the user if backend save fails, since we have it in state/localStorage
        }

        setIsEditingAddress(false);
        toast({
            title: "Address Updated",
            description: "Your shipping address has been updated successfully."
        });
    };

    const totalAmount = getCartTotal();

    // Determine payment details based on method
    const getPaymentDetails = () => {
        if (paymentMethod === 'card') {
            return cardDetails;
        }
        return null;
    };

    const getUpiId = () => {
        return paymentMethod === 'upi' ? upiId : null;
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            toast({
                title: "Cart is empty",
                description: "Please add items to your cart before placing an order.",
                variant: "destructive"
            });
            return;
        }

        if (!paymentMethod) {
            toast({
                title: "Select Payment Method",
                description: "Please select a payment method to proceed.",
                variant: "destructive"
            });
            return;
        }

        if (paymentMethod === 'card') {
            if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
                toast({
                    title: "Incomplete Details",
                    description: "Please fill all credit/debit card fields.",
                    variant: "destructive"
                });
                return;
            }
        } else if (paymentMethod === 'upi') {
            if (!upiId || !upiId.includes('@')) {
                toast({
                    title: "Invalid UPI ID",
                    description: "Please enter a valid UPI ID (e.g. yourname@ybl).",
                    variant: "destructive"
                });
                return;
            }
            if (!isUpiVerified && !selectedBank) {
                toast({
                    title: "Verification Required",
                    description: "Please verify your UPI ID or select a bank for Net Banking.",
                    variant: "destructive"
                });
                return;
            }
        } else if (paymentMethod === 'cod') {
             if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
                toast({
                    title: "Incomplete Address",
                    description: "Please ensure your shipping address is filled completely.",
                    variant: "destructive"
                });
                return;
             }
        }

        setIsProcessing(true);

        // Simulate payment processing for digital payments
        if (paymentMethod !== 'cod') {
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        try {
            // Construct payload matching OrderCreate model
            const orderPayload = {
                items: cart.map(item => ({
                    id: String(item.id),
                    name: item.name,
                    image: item.image,
                    smartFurniPrice: item.smartFurniPrice,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    name: shippingAddress.name,
                    street: shippingAddress.street,
                    city: shippingAddress.city,
                    pincode: shippingAddress.pincode,
                    state: shippingAddress.state,
                    phone: shippingAddress.phone
                },
                paymentMethod: paymentMethod,
                paymentDetails: paymentMethod === 'upi' && selectedBank ? { bank: selectedBank } : getPaymentDetails(),
                upiId: paymentMethod === 'upi' && upiId ? upiId : null,
                totalAmount: totalAmount
            };

            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/orders/`, orderPayload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = response.data;
            setPlacedOrderId(data.id);
            clearCart();
            setIsProcessing(false);
            setShowSuccessModal(true);

        } catch (error) {
            console.error("Order Error:", error);
            setIsProcessing(false);

            let errorMsg = "Something went wrong. Please try again.";
            if (error.response && error.response.data) {
                const detail = error.response.data.detail;
                if (Array.isArray(detail)) {
                    errorMsg = detail[0].msg;
                } else if (typeof detail === 'string') {
                    errorMsg = detail;
                }
            }

            toast({
                title: "Order Failed",
                description: errorMsg,
                variant: "destructive"
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleVerifyUpi = async () => {
        if (!upiId || !upiId.includes('@')) {
            toast({
                title: "Invalid UPI ID",
                description: "Please enter a valid UPI ID to verify.",
                variant: "destructive"
            });
            return;
        }

        setIsVerifyingUpi(true);
        // Simulate API call to verify UPI
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsVerifyingUpi(false);
        setIsUpiVerified(true);
        toast({
            title: "UPI Verified",
            description: "Your UPI ID has been successfully verified.",
        });
    };

    const handleUpiAppClick = (app) => {
        const suffixes = {
            'Google Pay': '@okaxis',
            'PhonePe': '@ybl',
            'Paytm': '@paytm',
            'BHIM': '@upi'
        };
        const currentId = upiId.split('@')[0];
        setUpiId(`${currentId || 'user'}${suffixes[app]}`);
        setIsUpiVerified(false);
    };

    const ProcessingOverlay = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Processing Payment</h3>
                    <p className="text-gray-500">Connecting to your bank securely. Do not refresh the page.</p>
                </div>
                <div className="flex justify-center gap-2">
                    <ShieldCheck className="text-green-500 w-5 h-5" />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Secured Transaction</span>
                </div>
            </div>
        </div>
    );

    const OrderSuccessModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center space-y-8 animate-in slide-in-from-bottom-8 duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <BadgeCheck className="w-16 h-16 text-green-600" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-extrabold text-gray-900">Order Placed!</h2>
                    <p className="text-gray-600">Thank you for shopping with SmartFurni. Your order has been placed successfully.</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-3 text-left">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="font-mono font-bold text-gray-900">#{placedOrderId.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Paid:</span>
                        <span className="font-bold text-orange-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment:</span>
                        <span className="capitalize font-medium text-gray-900">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</span>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <Button 
                        className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-lg font-bold"
                        onClick={() => navigate('/orders')}
                    >
                        View My Orders
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="w-full text-gray-500"
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Redirecting to login...</p>
            </div>
        );
    }

    if (showSuccessModal) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <OrderSuccessModal />
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
                    <p className="text-gray-600">Add some products to your cart to proceed to checkout.</p>
                    <Link to="/">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {isProcessing && <ProcessingOverlay />}
            {showSuccessModal && <OrderSuccessModal />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Cart Details & Shipping */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Cart Items */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Order Details</h2>
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-orange-600">
                                                        ₹ {item.smartFurniPrice.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        Total: ₹ {(item.smartFurniPrice * item.quantity).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address (Static for now) */}
                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                                {!isEditingAddress && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-orange-600"
                                        onClick={handleEditAddress}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>

                            {isEditingAddress ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={tempAddress.name}
                                                onChange={handleAddressChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="street">Street Address</Label>
                                            <Input
                                                id="street"
                                                name="street"
                                                value={tempAddress.street}
                                                onChange={handleAddressChange}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    value={tempAddress.city}
                                                    onChange={handleAddressChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pincode">Pincode</Label>
                                                <Input
                                                    id="pincode"
                                                    name="pincode"
                                                    value={tempAddress.pincode}
                                                    onChange={handleAddressChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State</Label>
                                                <Input
                                                    id="state"
                                                    name="state"
                                                    value={tempAddress.state}
                                                    onChange={handleAddressChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={tempAddress.phone}
                                                    onChange={handleAddressChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end mt-4">
                                        <Button variant="outline" onClick={() => setIsEditingAddress(false)}>Cancel</Button>
                                        <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSaveAddress}>Save Address</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 text-gray-600">
                                    <MapPin className="w-5 h-5 mt-0.5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">{shippingAddress.name}</p>
                                        <p>{shippingAddress.street}</p>
                                        <p>{shippingAddress.city}, {shippingAddress.pincode}</p>
                                        <p>{shippingAddress.state}</p>
                                        <p className="mt-1 font-medium">{shippingAddress.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Payment & Summary */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Order Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹ {totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (18% GST included)</span>
                                    <span>-</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center font-bold text-lg text-gray-900">
                                    <span>Total</span>
                                    <span>₹ {totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Payment Option</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                            className="text-orange-600 focus:ring-orange-500"
                                        />
                                        <CreditCard className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium text-gray-900">Credit / Debit Card</span>
                                    </label>

                                    {paymentMethod === 'card' && (
                                        <div className="mt-3 ml-8 space-y-3 p-3 bg-gray-50 rounded-md border border-gray-200 animate-in slide-in-from-top-2 fade-in duration-200">
                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="Card Number"
                                                    name="number"
                                                    value={cardDetails.number}
                                                    onChange={handleCardChange}
                                                    maxLength={19}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Input
                                                    placeholder="MM / YY"
                                                    name="expiry"
                                                    value={cardDetails.expiry}
                                                    onChange={handleCardChange}
                                                    maxLength={5}
                                                />
                                                <Input
                                                    placeholder="CVV"
                                                    name="cvv"
                                                    type="password"
                                                    value={cardDetails.cvv}
                                                    onChange={handleCardChange}
                                                    maxLength={3}
                                                />
                                            </div>
                                            <Input
                                                placeholder="Cardholder Name"
                                                name="name"
                                                value={cardDetails.name}
                                                onChange={handleCardChange}
                                            />
                                        </div>
                                    )}
                                </div>

                                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={() => setPaymentMethod('upi')}
                                        className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <Banknote className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">UPI / Net Banking</span>
                                </label>

                                {paymentMethod === 'upi' && (
                                    <div className="mt-3 ml-8 space-y-4 p-3 bg-gray-50 rounded-md border border-gray-200 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Pay via UPI</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Enter UPI ID (e.g. 9876543210@upi)"
                                                    className={`bg-white transition-all ${isUpiVerified ? 'border-green-500 bg-green-50' : ''}`}
                                                    value={upiId}
                                                    onChange={(e) => {
                                                        setUpiId(e.target.value);
                                                        setIsUpiVerified(false);
                                                    }}
                                                />
                                                <Button 
                                                    size="sm" 
                                                    variant={isUpiVerified ? "ghost" : "outline"} 
                                                    className={isUpiVerified ? "text-green-600" : "text-orange-600 border-orange-200 hover:bg-orange-50"}
                                                    onClick={handleVerifyUpi}
                                                    disabled={isVerifyingUpi || isUpiVerified}
                                                >
                                                    {isVerifyingUpi ? '...' : isUpiVerified ? <ShieldCheck size={18} /> : 'Verify'}
                                                </Button>
                                            </div>
                                            <div className="flex gap-3 mt-2 overflow-x-auto pb-1 no-scrollbar">
                                                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                                                    <div 
                                                        key={app} 
                                                        onClick={() => handleUpiAppClick(app)}
                                                        className="flex-shrink-0 px-3 py-1.5 bg-white border rounded text-xs font-medium text-gray-600 cursor-pointer hover:border-orange-500 hover:text-orange-600 transition-colors whitespace-nowrap"
                                                    >
                                                        {app}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-gray-50 px-2 text-muted-foreground">Or Net Banking</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Popular Banks</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'Others'].map(bank => (
                                                    <div 
                                                        key={bank} 
                                                        onClick={() => {
                                                            setSelectedBank(bank);
                                                            setIsUpiVerified(false);
                                                        }}
                                                        className={`flex items-center justify-center py-2 px-1 border rounded text-xs font-medium transition-all text-center cursor-pointer ${selectedBank === bank ? 'border-orange-600 bg-orange-50 text-orange-600 shadow-sm' : 'bg-white text-gray-600 hover:border-orange-500 hover:text-orange-600'}`}
                                                    >
                                                        {bank}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <Truck className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <span className="font-medium text-gray-900 block">Cash on Delivery</span>
                                        <span className="text-xs text-gray-500">Pay when you receive using Cash/UPI</span>
                                    </div>
                                </label>
                            </div>

                                <Button
                                    className="w-full mt-6 bg-orange-600 hover:bg-orange-700 h-12 text-lg font-semibold shadow-md"
                                    onClick={handlePlaceOrder}
                                    disabled={submitLoading || isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : 
                                     paymentMethod === 'cod' ? 'Place Order' :
                                     selectedBank ? `Pay via ${selectedBank}` :
                                     `Pay ₹ ${totalAmount.toLocaleString('en-IN')}`}
                                </Button>

                            <div className="mt-8 pt-6 border-t flex flex-col items-center gap-4">
                                <div className="flex items-center gap-6">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 hover:scale-110 transition-transform" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 hover:scale-110 transition-transform" />
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVoV9w_LOrmjal7IgzWNdzzjuO_mngQqb1KQ&s" alt="Visa" className="h-5 hover:scale-110 transition-transform" />
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
