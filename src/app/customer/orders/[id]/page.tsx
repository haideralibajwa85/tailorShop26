'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getSupabaseClient } from '../../../../lib/supabase';
import { FaArrowLeft, FaRulerCombined, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function OrderDetailPage() {
    const params = useParams();
    // Handle both UUID and OrderID (e.g. TS-001) lookup if needed, but schema uses UUID mostly. 
    // However, users might use TS-001 in URL. Let's support Order ID lookup.
    const orderId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [measurements, setMeasurements] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const supabase = getSupabaseClient();
            if (!supabase) {
                toast.error('Database connection unavailable');
                setLoading(false);
                return;
            }
            
            // Try to find by UUID first, then by order_id string
            let query = supabase.from('orders').select('*');

            // Simple check if it looks like a uuid
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

            if (isUuid) {
                query = query.eq('id', orderId);
            } else {
                query = query.eq('order_id', orderId);
            }

            const { data: orderData, error: orderError } = await query.single();

            if (orderError) {
                // PGRST116 is the code for "JSON object requested, multiple (or no) rows returned"
                // When using .single(), if no rows are found, it throws this.
                if (orderError.code === 'PGRST116') {
                    console.log('Order not found');
                    setOrder(null);
                    return;
                }
                throw orderError;
            }

            setOrder(orderData);

            if (orderData) {
                console.log('Fetching measurements for Order UUID:', orderData.id);
                const { data: measData, error: measError } = await supabase
                    .from('order_measurements')
                    .select('*')
                    .eq('order_id', orderData.id)
                    .single();

                console.log('Measurements Fetch Result:', { data: measData, error: measError });
                setMeasurements(measData);
            }

        } catch (error: any) {
            console.error('Error fetching order details:', error.message || error);
            toast.error('Could not load order details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading order details...</div>;
    if (!order) return <div className="p-8 text-center">Order not found.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/customer/orders" className="flex items-center text-gray-500 hover:text-blue-600 mb-6">
                <FaArrowLeft className="mr-2" /> Back to Orders
            </Link>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Order #{order.order_id}</h1>
                        <p className="opacity-90">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="px-4 py-1 bg-white/20 rounded-full font-semibold backdrop-blur-sm uppercase text-sm">
                        {order.status.replace('_', ' ')}
                    </div>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaInfoCircle className="mr-2 text-blue-500" /> Order Details
                        </h3>
                        <div className="space-y-3 text-gray-600">
                            <div className="flex justify-between border-b pb-2">
                                <span>Category</span>
                                <span className="font-medium text-gray-900">{order.category}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>Type</span>
                                <span className="font-medium text-gray-900">{order.clothing_type}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>Fabric</span>
                                <span className="font-medium text-gray-900">{order.fabric_type} ({order.color})</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>Quantity</span>
                                <span className="font-medium text-gray-900">{order.quantity}</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span>Completion Date</span>
                                <span className="font-medium text-blue-600">{new Date(order.expected_completion_date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {order.custom_notes && (
                            <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <span className="block font-medium text-yellow-800 mb-1">Custom Notes:</span>
                                <p className="text-yellow-700 text-sm">{order.custom_notes}</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaRulerCombined className="mr-2 text-blue-500" /> Measurements
                        </h3>
                        {measurements ? (
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(measurements).map(([key, value]) => {
                                    if (['id', 'order_id', 'created_at', 'updated_at', 'measurement_notes'].includes(key)) return null;
                                    if (!value) return null;
                                    return (
                                        <div key={key} className="bg-gray-50 p-3 rounded-lg text-center">
                                            <span className="block text-xs uppercase text-gray-500 mb-1">{key.replace('_', ' ')}</span>
                                            <span className="block font-bold text-gray-800">{String(value)}"</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No specific measurements recorded.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
