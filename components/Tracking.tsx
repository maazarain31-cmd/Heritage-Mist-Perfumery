import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { Order } from '../types';
import { OrderStatus } from '../types';
import { api } from '../services/api';

const statusSteps = [OrderStatus.Packing, OrderStatus.Shipped, OrderStatus.Delivered];
const verificationStep = OrderStatus.PaymentVerification;

export const Tracking: React.FC = () => {
    const location = useLocation();
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const paramOrderId = params.get('orderId');
        const paramEmail = params.get('email');
        if (paramOrderId) {
            setOrderId(paramOrderId);
        }
        if (paramEmail) {
            setEmail(paramEmail);
        }
    }, [location.search]);

    const handleTrackOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setTrackedOrder(null);
        try {
            const order = await api.trackOrder(orderId, email);
            setTrackedOrder(order);
        } catch (err: any) {
            setError(err.message || 'No order found with that ID and email combination.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIndex = (status: OrderStatus) => {
        return statusSteps.indexOf(status);
    }
    
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Track Your Order</h1>
                <form onSubmit={handleTrackOrder} className="space-y-4">
                    <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Transaction ID (e.g., HM-XXXX)" className="w-full p-3 border rounded-md" required />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full p-3 border rounded-md" required />
                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400">
                        {isLoading ? 'Searching...' : 'Track Order'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
            </div>

            {trackedOrder && (
                <div className="max-w-4xl mx-auto bg-white p-8 mt-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">Order Details for #{trackedOrder.id}</h2>
                    <div className="mt-6">
                       {trackedOrder.status === verificationStep ? (
                           <div className="text-center p-6 bg-yellow-50 rounded-lg">
                               <p className="font-semibold text-lg text-yellow-800">{verificationStep}</p>
                               <p className="text-yellow-600 mt-1">Your online payment is being verified. The status will update once confirmed.</p>
                           </div>
                       ) : (
                            <div>
                                <div className="flex justify-between items-center">
                                    {statusSteps.map((step, index) => (
                                        <div key={step} className={`flex-1 text-center ${index <= getStatusIndex(trackedOrder.status) ? 'font-bold text-gray-800' : 'text-gray-400'}`}>
                                            {step}
                                        </div>
                                    ))}
                                </div>
                                <div className="relative mt-2">
                                    <div className="h-1 bg-gray-200 rounded-full"></div>
                                    <div className="absolute top-0 left-0 h-1 bg-green-500 rounded-full" style={{ width: `${(getStatusIndex(trackedOrder.status) / (statusSteps.length - 1)) * 100}%` }}></div>
                                </div>
                            </div>
                       )}
                    </div>
                    <div className="mt-8 border-t pt-6">
                        <h3 className="font-semibold mb-4">Items:</h3>
                        {trackedOrder.items.map(item => (
                            <div key={`${item.id}-${item.size}`} className="flex justify-between items-center mb-2">
                                <span>{item.name} (x{item.quantity}) - {item.size}</span>
                                <span>₨ {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                         <div className="flex justify-between font-bold mt-4 pt-2 border-t">
                            <span>Total</span>
                            <span>₨ {trackedOrder.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
