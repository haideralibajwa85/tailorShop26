'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          users:customer_id (full_name, email)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
        const newStatus = window.prompt(`Enter new status (pending, in_stitching, completed, cancelled). Current: ${currentStatus}`, currentStatus);
        if (!newStatus || newStatus === currentStatus) return;

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus.toLowerCase() })
                .eq('id', orderId);

            if (error) throw error;
            toast.success('Order status updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="p-8 text-center bg-slate-50 min-h-screen pt-20">Loading orders...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                    <p className="text-gray-600">View and manage all customer orders</p>
                </div>
                <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
                    Back to Dashboard
                </Link>
            </header>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-700 border-b">
                            <th className="p-4 font-semibold">Order ID</th>
                            <th className="p-4 font-semibold">Customer</th>
                            <th className="p-4 font-semibold">Type</th>
                            <th className="p-4 font-semibold hidden md:table-cell">Date</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{order.order_id}</td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{order.users?.full_name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{order.users?.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">{order.clothing_type}</td>
                                    <td className="p-4 text-gray-600 hidden md:table-cell">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase 
                      ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'in_stitching' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 flex space-x-2">
                                        <Link href={`/customer/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors" title="View Details">
                                            <FaEye />
                                        </Link>
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, order.status)}
                                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition-colors"
                                            title="Update Status"
                                        >
                                            <FaEdit />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
