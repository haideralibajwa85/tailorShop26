'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { orderAPI } from '../../../lib/api';
import { FaClipboardCheck, FaHourglassHalf, FaPlus, FaMoneyBillWave, FaUserTie } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function TailorOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [stitchers, setStitchers] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [extraCharges, setExtraCharges] = useState<Record<string, any[]>>({});
    const [tailorProfile, setTailorProfile] = useState<any>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        if (!supabase) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            setTailorProfile(profile);

            if (profile?.organization_id) {
                // Fetch Stitchers
                let stitcherQuery = supabase
                    .from('users')
                    .select('*')
                    .eq('role', 'stitcher');

                // If organization_id exists, filter by it; otherwise get all stitchers
                if (profile.organization_id) {
                    stitcherQuery = stitcherQuery.eq('organization_id', profile.organization_id);
                }

                const { data: stitchersData } = await stitcherQuery;
                setStitchers(stitchersData || []);
            } else {
                // If no organization_id, fetch all stitchers
                const { data: stitchersData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('role', 'stitcher');
                setStitchers(stitchersData || []);
            }

            fetchOrders(user.id);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchOrders = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`*, users!customer_id (full_name)`)
                .eq('tailor_id', userId)
                .in('status', ['pending', 'in_stitching', 'completed'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);

            if (data) {
                const chargesMap: Record<string, any[]> = {};
                const assignmentsMap: Record<string, any> = {};

                for (const order of data) {
                    // Fetch charges
                    const charges = await orderAPI.getExtraCharges(order.id);
                    chargesMap[order.id] = charges;

                    // Fetch assignment
                    const { data: assignment } = await supabase
                        .from('work_assignments')
                        .select('*, users!stitcher_id(full_name)')
                        .eq('order_id', order.id)
                        .maybeSingle(); // Use maybeSingle to avoid 406 error if none exists

                    if (assignment) {
                        assignmentsMap[order.id] = assignment;
                    }
                }
                setExtraCharges(chargesMap);
                setAssignments(assignmentsMap);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignStitcher = async (orderId: string, stitcherId: string) => {
        if (!stitcherId) return;
        try {
            // Check if exists
            const existing = assignments[orderId];

            if (existing) {
                // Update
                const { error } = await supabase
                    .from('work_assignments')
                    .update({ stitcher_id: stitcherId })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('work_assignments')
                    .insert([{
                        order_id: orderId,
                        stitcher_id: stitcherId,
                        tailor_id: tailorProfile.id,
                        status: 'pending'
                    }]);
                if (error) throw error;
            }

            toast.success('Stitcher assigned successfully');
            fetchOrders(tailorProfile.id); // Refresh to get names and IDs
        } catch (error: any) {
            console.error('Error assigning stitcher:', error);
            toast.error('Failed to assign stitcher');
        }
    };

    const updateFinancials = async (id: string, total: number, advance: number) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    total_amount: total,
                    advance_amount: advance,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            // Optimistic update or refresh
            fetchOrders(tailorProfile.id);
        } catch (error: any) {
            console.error('Error updating financials:', error);
            alert(error.message);
        }
    };

    const handleAddExtraCharge = async (orderId: string, amount: number, description: string) => {
        try {
            await orderAPI.addExtraCharge(orderId, amount, description);
            fetchOrders(tailorProfile.id);
        } catch (error: any) {
            console.error('Error adding extra charge:', error);
            alert(error.message);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            fetchOrders(tailorProfile.id);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assigned Orders</h1>
                    <p className="text-gray-600">Update status as you work</p>
                </div>
                <Link href="/tailor/dashboard" className="text-blue-600 hover:underline">
                    Back to Dashboard
                </Link>
            </header>

            <div className="grid gap-6">
                {orders.length === 0 ? <p className="text-gray-500">No orders currently assigned.</p> : orders.map((order: any) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-50 bg-gray-50/50">
                            <div className="mb-4 md:mb-0 w-full md:w-auto">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="font-bold text-lg text-gray-900">{order.order_id}</span>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'in_stitching' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-gray-600 font-medium">{order.clothing_type} for <strong>{order.users?.full_name}</strong></p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-xs text-gray-400">Due: {new Date(order.expected_completion_date).toLocaleDateString()}</span>
                                    <Link href={`/tailor/orders/${order.order_id || order.id}`} className="text-xs text-blue-600 hover:underline font-bold">
                                        View Details & Measurements
                                    </Link>
                                </div>
                            </div>

                            {/* Action Buttons & Assignment */}
                            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                                {/* Stitcher Assignment */}
                                <div className="flex items-center gap-2">
                                    <FaUserTie className="text-gray-400" />
                                    <select
                                        className="text-sm p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={assignments[order.id]?.stitcher_id || ''}
                                        onChange={(e) => handleAssignStitcher(order.id, e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {stitchers.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.full_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex space-x-3">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'in_stitching')}
                                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-100"
                                        >
                                            <FaHourglassHalf className="mr-2" /> Start Stitching
                                        </button>
                                    )}
                                    {order.status === 'in_stitching' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'completed')}
                                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-100"
                                        >
                                            <FaClipboardCheck className="mr-2" /> Mark Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Financial Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center">
                                    <FaMoneyBillWave className="mr-2 text-emerald-600" /> Payment & Settlement
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total Amount ($)</label>
                                        <input
                                            type="number"
                                            value={order.total_amount || 0}
                                            onChange={(e) => updateFinancials(order.id, parseFloat(e.target.value) || 0, order.advance_amount || 0)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Advance ($)</label>
                                        <input
                                            type="number"
                                            value={order.advance_amount || 0}
                                            onChange={(e) => updateFinancials(order.id, order.total_amount || 0, parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remaining Balance:</span>
                                    <span className={`text-lg font-black ${((order.total_amount || 0) + (extraCharges[order.id]?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0) - (order.advance_amount || 0)) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        ${((order.total_amount || 0) + (extraCharges[order.id]?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0) - (order.advance_amount || 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Extra Charges Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center justify-between">
                                    <span>Extra Charges</span>
                                    <button
                                        onClick={() => {
                                            const desc = prompt('Reason for extra charge?');
                                            const amt = prompt('Amount?');
                                            if (desc && amt) handleAddExtraCharge(order.id, parseFloat(amt), desc);
                                        }}
                                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors flex items-center text-[10px] uppercase font-black"
                                    >
                                        <FaPlus className="mr-1" /> Add Charge
                                    </button>
                                </h3>
                                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                                    {(extraCharges[order.id] || []).map((charge: any) => (
                                        <div key={charge.id} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50">
                                            <span className="text-gray-600">{charge.description}</span>
                                            <span className="font-bold text-gray-900">${charge.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {(!extraCharges[order.id] || extraCharges[order.id].length === 0) && (
                                        <p className="text-[10px] text-gray-400 italic py-2">No extra charges added.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
