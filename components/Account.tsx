import React, { useState, useEffect } from 'react';
import type { User, Order } from '../types';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

interface AccountProps {
    user: User;
    convertPrice: (price: number) => string;
}

export const Account: React.FC<AccountProps> = ({ user, convertPrice }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const userOrders = await api.getOrdersByUser();
                setOrders(userOrders);
            } catch (error) {
                console.error("Failed to fetch user orders:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [user.email]);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-2">My Account</h1>
            <p className="text-gray-600 mb-8">Welcome back, {user.email}. View your order history below.</p>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6">Order History</h2>
                {isLoading ? (
                    <p>Loading your orders...</p>
                ) : orders.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                        <Link to="/" className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-800 font-medium">
                                            {order.id}
                                            <Link to={`/tracking?orderId=${order.id}&email=${order.userEmail}`} className="text-blue-600 hover:underline ml-2 text-xs">(Track)</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{convertPrice(order.total)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'Payment Verification' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
