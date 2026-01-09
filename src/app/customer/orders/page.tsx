'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase'; // Adjust path if needed
import { FaBox, FaCalendar, FaChevronRight } from 'react-icons/fa';
import { orderAPI } from '../../../lib/api';
import { toast } from 'react-hot-toast';

export default function OrderListPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                <Link href="/customer/orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    New Order
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <FaBox className="mx-auto text-gray-300 text-4xl mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="text-gray-500 mt-1">Start by creating your first custom order.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <Link key={order.id} href={`/customer/orders/${order.order_id || order.id}`}>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex justify-between items-center group">
                                <div>
                                    <div className="flex items-center space-x-3 mb-1">
                                        <span className="font-bold text-lg text-gray-900">{order.order_id}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                      ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'in_stitching' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-gray-600">{order.category} - {order.clothing_type}</p>
                                    <div className="flex items-center text-sm text-gray-500 mt-2">
                                        <FaCalendar className="mr-2" />
                                        Due: {new Date(order.expected_completion_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {order.status === 'pending' && (
                                        <>
                                            <Link
                                                href={`/customer/orders/edit/${order.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Order"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </Link>
                                            <button
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Order"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (confirm('Are you sure you want to delete this order?')) {
                                                        try {
                                                            await orderAPI.deleteOrder(order.id);
                                                            toast.success('Order deleted');
                                                            fetchOrders();
                                                        } catch (err: any) {
                                                            toast.error(err.message || 'Failed to delete order');
                                                        }
                                                    }
                                                }}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </>
                                    )}
                                    <FaChevronRight className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
