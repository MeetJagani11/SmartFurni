import React from 'react';
import { useCart } from '../context/CartContext';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const {
        cart,
        isCartOpen,
        closeCart,
        removeFromCart,
        updateQuantity,
        getCartTotal
    } = useCart();

    const navigate = useNavigate();

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    return (
        <Sheet open={isCartOpen} onOpenChange={closeCart}>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Your Cart ({cart.length})
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                                <p className="text-sm text-gray-500">Looks like you haven't added anything yet.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={closeCart}
                                className="mt-4"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-medium text-sm line-clamp-2 text-gray-900">{item.name}</h4>
                                            <p className="text-sm font-semibold text-orange-600 mt-1">
                                                ₹ {item.smartFurniPrice.toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2 border rounded-md p-1 bg-white">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 hover:bg-gray-100 rounded md:p-0.5"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={14} className={item.quantity <= 1 ? "text-gray-300" : "text-gray-600"} />
                                                </button>
                                                <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:bg-gray-100 rounded md:p-0.5"
                                                >
                                                    <Plus size={14} className="text-gray-600" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <SheetFooter className="border-t pt-4 sm:flex-col sm:space-x-0">
                        <div className="space-y-4 w-full">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">₹ {getCartTotal().toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>₹ {getCartTotal().toLocaleString('en-IN')}</span>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    Shipping & taxes calculated at checkout
                                </p>
                            </div>

                            <Button
                                className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base"
                                onClick={handleCheckout}
                            >
                                Checkout
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={closeCart}
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
