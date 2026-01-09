'use client';

import { useState, useEffect } from 'react';
import { FaClipboardList, FaCheckCircle, FaRulerCombined, FaUsers, FaPlus, FaClock, FaUserTie } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutButton from '../../../components/LogoutButton';
import { supabase } from '../../../lib/supabase';
import { workAssignmentService } from '../../../lib/workAssignmentService';
import { toast } from 'react-hot-toast';
import StitcherModal from '../../../components/StitcherModal';

const StatCard = ({ href, icon, title, count, description, gradient }: { href: string; icon: React.ReactNode; title: string; count: number | string; description: string; gradient: string; }) => (
    <Link href={href} className={`group block p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${gradient}`}>
        <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <span className="text-3xl font-bold text-white">{count}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
    </Link>
);

export default function TailorDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });

    // Changed: 'assignments' now tracks the map of orderId -> assignment data (like in Orders page)
    const [assignmentsMap, setAssignmentsMap] = useState<Record<string, any>>({});
    // New: 'recentOrders' tracks the actual list of orders to display
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    const [stitchers, setStitchers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStitcher, setEditingStitcher] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            setCurrentUser(profile);

            // 1. Fetch ALL active orders (Pending & In Stitching) for Tracker
            const { data: orders } = await supabase
                .from('orders')
                .select(`*, users!customer_id (full_name)`)
                .eq('tailor_id', user.id)
                .order('created_at', { ascending: false });

            if (orders) {
                // Calc stats
                const counts = {
                    pending: orders.filter((o: any) => o.status === 'pending').length || 0,
                    inProgress: orders.filter((o: any) => o.status === 'inStitching' || o.status === 'in_stitching').length || 0,
                    completed: orders.filter((o: any) => o.status === 'completed').length || 0,
                };
                setStats(counts);

                // Filter for "Live" tracker (Active only + maybe top 10 recent)
                const activeOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'in_stitching' || o.status === 'inStitching').slice(0, 10);
                setRecentOrders(activeOrders);

                // Fetch assignments for these orders
                const map: Record<string, any> = {};
                for (const order of activeOrders) {
                    const { data: assignment } = await supabase
                        .from('work_assignments')
                        .select('*, users!stitcher_id(full_name)')
                        .eq('order_id', order.id)
                        .maybeSingle();
                    if (assignment) {
                        map[order.id] = assignment;
                    }
                }
                setAssignmentsMap(map);
            }

            // 2. Fetch Team Members (Stitchers)
            console.log('Fetching stitchers for organization:', profile?.organization_id);

            let stitcherQuery = supabase
                .from('users')
                .select('*')
                .eq('role', 'stitcher');

            // If organization_id exists, filter by it; otherwise get all stitchers
            if (profile?.organization_id) {
                stitcherQuery = stitcherQuery.eq('organization_id', profile.organization_id);
            }

            const { data: team, error: teamError } = await stitcherQuery;

            if (teamError) {
                console.error('Error fetching stitchers:', teamError);
            }
            console.log('Fetched stitchers:', team);
            setStitchers(team || []);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignStitcher = async (orderId: string, stitcherId: string) => {
        if (!stitcherId || !currentUser) return;
        try {
            const existing = assignmentsMap[orderId];

            if (existing) {
                const { error } = await supabase
                    .from('work_assignments')
                    .update({ stitcher_id: stitcherId })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('work_assignments')
                    .insert([{
                        order_id: orderId,
                        stitcher_id: stitcherId,
                        tailor_id: currentUser.id,
                        status: 'pending'
                    }]);
                if (error) throw error;
            }

            toast.success('Stitcher assigned successfully');
            loadDashboardData(); // Refresh
        } catch (error: any) {
            console.error('Error assigning stitcher:', error);
            toast.error('Failed to assign stitcher');
        }
    };

    const handleEditStitcher = (stitcher: any) => {
        setEditingStitcher(stitcher);
        setShowEditModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Tailor Dashboard</h1>
                    <p className="text-gray-600 mt-2 font-medium">Manage your production line and team.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/tailor/customers"
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95"
                    >
                        <FaUsers /> Manage Customers
                    </Link>
                    <Link
                        href="/tailor/stitchers/new"
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                    >
                        <FaPlus /> Add Stitcher
                    </Link>
                    <LogoutButton />
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <StatCard
                    href="/tailor/orders?status=pending"
                    icon={<FaClipboardList className="text-white text-xl" />}
                    title="Pending Tasks"
                    count={stats.pending}
                    description="Orders waiting for assignment"
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    href="/tailor/orders?status=in_stitching"
                    icon={<FaClock className="text-white text-xl" />}
                    title="In Progress"
                    count={stats.inProgress}
                    description="Currently under production"
                    gradient="bg-gradient-to-br from-amber-500 to-amber-600"
                />
                <StatCard
                    href="/tailor/orders?status=completed"
                    icon={<FaCheckCircle className="text-white text-xl" />}
                    title="Completed History"
                    count={stats.completed}
                    description="Successfully finished orders"
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Work Tracking */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                        <h2 className="text-xl font-bold text-gray-900">Live Work Tracker</h2>
                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Real-time</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-gray-600 text-sm uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Stitcher Assignment</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.length > 0 ? recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-blue-600">
                                            <Link href={`/tailor/orders/${order.order_id || order.id}`} className="hover:underline">
                                                {order.order_id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 capitalize">
                                            {order.clothing_type}<br />
                                            <span className="text-[10px] text-gray-400 font-normal">for {order.users?.full_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaUserTie className="text-gray-400" />
                                                <select
                                                    className="text-sm p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                    value={assignmentsMap[order.id]?.stitcher_id || ''}
                                                    onChange={(e) => handleAssignStitcher(order.id, e.target.value)}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {stitchers.map(s => (
                                                        <option key={s.id} value={s.id}>{s.full_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                (order.status === 'in_stitching' || order.status === 'inStitching') ? 'bg-amber-100 text-amber-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                            No pending or active orders.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Team Sidebar */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FaUsers className="text-indigo-600" /> My Team
                        </h2>
                        <Link href="/tailor/stitchers" className="text-sm text-blue-600 hover:underline">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {stitchers.length > 0 ? stitchers.map((stitcher: any) => (
                            <div key={stitcher.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                                        {stitcher.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{stitcher.full_name}</p>
                                        <p className="text-xs text-gray-500">ID: {stitcher.email.split('@')[0]}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditStitcher(stitcher)}
                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <FaPlus className="rotate-45" title="Edit" />
                                    </button>
                                    <span className={`block text-[10px] font-black uppercase tracking-widest ${stitcher.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                        {stitcher.is_active ? 'Active' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500 mb-4">No team members registered yet.</p>
                                <Link
                                    href="/tailor/stitchers"
                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                                >
                                    + Register your first stitcher
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showEditModal && (
                <StitcherModal
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        loadDashboardData();
                    }}
                    stitcher={editingStitcher}
                    tailorId={currentUser?.id}
                    organizationId={currentUser?.organization_id}
                />
            )}
        </div>
    );
}
