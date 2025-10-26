import React, { useState, useEffect, useMemo } from 'react';
import type { Order } from '../types';
import { OrderStatus } from '../types';
import { api } from '../services/api';

interface AdminProps {
    onLogout: () => void;
}

export const Admin: React.FC<AdminProps> = ({ onLogout }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
    const [sortOption, setSortOption] = useState('date-desc');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const allOrders = await api.getAllOrders();
            setOrders(allOrders);
        } catch (error) {
            console.error("Failed to fetch all orders:", error);
            // Optionally, handle logout if token is invalid
            if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
                onLogout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        try {
            await api.updateOrderStatus(orderId, status);
            fetchOrders(); // Refresh the list
        } catch (error) {
            console.error("Failed to update order status:", error);
            alert("Failed to update status. Please try again.");
        }
    };

    const displayedOrders = useMemo(() => {
        let filtered = orders;

        if (filterStatus !== 'all') {
            filtered = orders.filter(order => order.status === filterStatus);
        }

        const sorted = [...filtered].sort((a, b) => {
            switch (sortOption) {
                case 'date-asc':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'total-desc':
                    return b.total - a.total;
                case 'total-asc':
                    return a.total - b.total;
                case 'date-desc':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return sorted;
    }, [orders, filterStatus, sortOption]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard - All Orders</h1>
                <button 
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>

            <div className="flex justify-start items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                 <div>
                    <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">Filter by Status</label>
                    <select
                        id="filterStatus"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm rounded-md"
                    >
                        <option value="all">All Statuses</option>
                        {Object.values(OrderStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700">Sort by</label>
                    <select
                        id="sortOption"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm rounded-md"
                    >
                        <option value="date-desc">Date (Newest First)</option>
                        <option value="date-asc">Date (Oldest First)</option>
                        <option value="total-desc">Total (High to Low)</option>
                        <option value="total-asc">Total (Low to High)</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <p>Loading orders...</p>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.userEmail}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">₨ {order.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {order.paymentMethod}
                                        {order.paymentScreenshot && <a href={order.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-blue-500 ml-2">(view)</a>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' :
                                            order.status === OrderStatus.Shipped ? 'bg-blue-100 text-blue-800' :
                                            order.status === OrderStatus.PaymentVerification ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            className="p-1 border rounded-md"
                                        >
                                            {Object.values(OrderStatus).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
