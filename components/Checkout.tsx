import React, { useState, useEffect } from 'react';
import type { CartItem, User, ShippingDetails, Order } from '../types';
import { PaymentMethod, OrderStatus } from '../types';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

interface CheckoutProps {
    cart: CartItem[];
    user: User | null;
    setLastOrder: (order: Order) => void;
    clearCart: () => void;
    convertPrice: (price: number) => string;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const Checkout: React.FC<CheckoutProps> = ({ cart, user, setLastOrder, clearCart, convertPrice }) => {
    const navigate = useNavigate();
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
        name: '', address: '', area: '', city: '', country: 'Pakistan', postalCode: ''
    });
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
    const [paymentTransactionId, setPaymentTransactionId] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (!user || cart.length === 0) {
            navigate('/');
        }
    }, [user, cart, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentScreenshot(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        for (const key in shippingDetails) {
            if (!shippingDetails[key as keyof ShippingDetails]) {
                setError('Please fill in all shipping details.');
                return;
            }
        }
        if (paymentMethod === PaymentMethod.Online) {
            setError('Online payment is not yet available.');
            return;
        }
        setError('');
        setIsPlacingOrder(true);

        try {
            const orderItems = cart.map(({ stock, category, mainAccords, availableSizes, ...item }) => item);
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const newOrder = await api.placeOrder({
                items: orderItems,
                total,
                shippingDetails,
                paymentMethod,
            });

            setLastOrder(newOrder);
            clearCart();
            navigate('/order-success');
        } catch (err) {
            console.error("Failed to place order:", err);
            setError('There was an issue placing your order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const subtotalInPkr = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subtotalDisplay = convertPrice(subtotalInPkr);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input name="name" value={shippingDetails.name} onChange={handleInputChange} placeholder="Full Name" className="w-full p-3 border rounded-md" required />
                        <input name="address" value={shippingDetails.address} onChange={handleInputChange} placeholder="Address" className="w-full p-3 border rounded-md" required />
                        <input name="area" value={shippingDetails.area} onChange={handleInputChange} placeholder="Area / Neighborhood" className="w-full p-3 border rounded-md" required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="city" value={shippingDetails.city} onChange={handleInputChange} placeholder="City" className="w-full p-3 border rounded-md" required />
                            <input name="postalCode" value={shippingDetails.postalCode} onChange={handleInputChange} placeholder="Postal Code" className="w-full p-3 border rounded-md" required />
                        </div>
                        <input name="country" value={shippingDetails.country} onChange={handleInputChange} placeholder="Country" className="w-full p-3 border rounded-md bg-gray-100" readOnly />

                        <h2 className="text-2xl font-semibold mb-4 pt-6">Payment Method</h2>
                        <div className="space-y-3">
                           <div onClick={() => setPaymentMethod(PaymentMethod.COD)} className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === PaymentMethod.COD ? 'border-gray-800 ring-2 ring-gray-800' : ''}`}>
                               <p className="font-semibold">Cash on Delivery (COD)</p>
                               <p className="text-sm text-gray-500">Pay with cash upon delivery.</p>
                           </div>
                           <div className="relative p-4 border rounded-lg cursor-not-allowed opacity-60">
                                <p className="font-semibold">Online Payment</p>
                                <p className="text-sm text-gray-500">Pay via bank transfer or other online methods.</p>
                                <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">Coming Soon</span>
                           </div>
                        </div>

                        {error && <p className="text-red-500 mt-4">{error}</p>}
                        <button type="submit" disabled={isPlacingOrder} className="w-full mt-6 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400">
                            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md h-min">
                    <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={`${item.id}-${item.size}`} className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <img src={item.img} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} | Size: {item.size}</p>
                                    </div>
                                </div>
                                <p>{convertPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t">
                         <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>{subtotalDisplay}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
