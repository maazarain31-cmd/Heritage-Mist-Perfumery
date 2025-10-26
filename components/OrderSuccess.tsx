
import React from 'react';
import type { Order } from '../types';
import { Link } from 'react-router-dom';

interface OrderSuccessProps {
    order: Order | null;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ order }) => {
    if (!order) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">No order details found.</h1>
                <Link to="/" className="mt-4 inline-block px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition">
                    Back to Shop
                </Link>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="bg-white p-10 rounded-lg shadow-xl max-w-2xl mx-auto">
                <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h1 className="text-4xl font-bold mt-4">Order Placed Successfully!</h1>
                <p className="text-gray-600 mt-4">Thank you for your purchase. An email confirmation has been sent to {order.userEmail}.</p>
                <p className="mt-6 font-semibold text-lg">Your Transaction ID is:</p>
                <p className="mt-2 text-2xl font-mono bg-gray-100 p-3 rounded-md inline-block">{order.id}</p>
                <p className="mt-6 text-gray-600">You can use this ID to track your order status.</p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link to="/tracking" className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition">
                        Track Your Order
                    </Link>
                    <Link to="/" className="px-6 py-3 bg-white text-gray-900 border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};
