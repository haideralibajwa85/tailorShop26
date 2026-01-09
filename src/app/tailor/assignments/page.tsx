'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaClipboardList } from 'react-icons/fa';
import { workAssignmentService } from '../../../../lib/workAssignmentService';
import { stitcherAuth } from '../../../../lib/stitcherAuth';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function WorkAssignmentsPage() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [stitchers, setStitchers] = useState<any[]>([]);
    const [unassignedOrders, setUnassignedOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'tailor') {
            toast.error('Access denied. Tailors only.');
            router.push('/');
            return;
        }

        setCurrentUser(profile);
        loadData(user.id, profile.organization_id);
    };

    const loadData = async (tailorId: string, orgId: string) => {
        setIsLoading(true);

        // Load assignments
        const assignmentsResult = await workAssignmentService.getAssignmentsByTailor(tailorId);
        if (assignmentsResult.success) {
            setAssignments(assignmentsResult.data || []);
        }

        // Load stitchers
        const stitchersResult = await stitcherAuth.getStitchersByTailor(tailorId);
        if (stitchersResult.success) {
            setStitchers(stitchersResult.data?.filter((s: any) => s.is_active) || []);
        }

        // Load unassigned orders
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('organization_id', orgId)
            .is('assigned_stitcher_id', null)
            .in('status', ['pending', 'in_stitching'])
            .order('created_at', { ascending: false });

        setUnassignedOrders(orders || []);
        setIsLoading(false);
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            assigned: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            on_hold: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Work Assignments</h1>
                        <p className="text-gray-600 mt-2">Assign orders to stitchers and track progress</p>
                    </div>
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all"
                    >
                        <FaPlus />
                        <span>Assign Work</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-600">Total Assignments</div>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{assignments.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-600">In Progress</div>
                        <div className="text-3xl font-bold text-blue-600 mt-2">
                            {assignments.filter(a => a.status === 'in_progress').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-600">Completed</div>
                        <div className="text-3xl font-bold text-green-600 mt-2">
                            {assignments.filter(a => a.status === 'completed').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-600">Unassigned Orders</div>
                        <div className="text-3xl font-bold text-orange-600 mt-2">{unassignedOrders.length}</div>
                    </div>
                </div>

                {/* Assignments List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Active Assignments</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="text-gray-500">Loading...</div>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="p-12 text-center">
                            <FaClipboardList className="mx-auto text-6xl text-gray-300 mb-4" />
                            <p className="text-gray-500">No assignments yet. Assign work to your stitchers!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stitcher</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{assignment.orders?.order_id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{assignment.stitchers?.full_name}</div>
                                                <div className="text-xs text-gray-500">{assignment.stitchers?.specialization}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {assignment.orders?.clothing_type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${assignment.progress_percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-600">{assignment.progress_percentage}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                                    {assignment.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(assignment.assigned_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Work Modal */}
            {showAssignModal && (
                <AssignWorkModal
                    onClose={() => setShowAssignModal(false)}
                    onSuccess={() => {
                        setShowAssignModal(false);
                        loadData(currentUser.id, currentUser.organization_id);
                    }}
                    tailorId={currentUser?.id}
                    organizationId={currentUser?.organization_id}
                    stitchers={stitchers}
                    unassignedOrders={unassignedOrders}
                />
            )}
        </div>
    );
}

// Assign Work Modal Component
function AssignWorkModal({ onClose, onSuccess, tailorId, organizationId, stitchers, unassignedOrders }: any) {
    const [formData, setFormData] = useState({
        order_id: '',
        stitcher_id: '',
        estimated_hours: '',
        assignment_notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await workAssignmentService.assignWork(tailorId, {
            order_id: formData.order_id,
            stitcher_id: formData.stitcher_id,
            organization_id: organizationId,
            estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
            assignment_notes: formData.assignment_notes || undefined,
        });

        if (result.success) {
            toast.success('Work assigned successfully!');
            onSuccess();
        } else {
            toast.error(result.error || 'Failed to assign work');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Assign Work to Stitcher</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Order *</label>
                        <select
                            value={formData.order_id}
                            onChange={e => setFormData({ ...formData, order_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Choose an order...</option>
                            {unassignedOrders.map((order: any) => (
                                <option key={order.id} value={order.id}>
                                    {order.order_id} - {order.clothing_type} ({order.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Stitcher *</label>
                        <select
                            value={formData.stitcher_id}
                            onChange={e => setFormData({ ...formData, stitcher_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Choose a stitcher...</option>
                            {stitchers.map((stitcher: any) => (
                                <option key={stitcher.id} value={stitcher.id}>
                                    {stitcher.full_name} {stitcher.specialization ? `(${stitcher.specialization})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                        <input
                            type="number"
                            step="0.5"
                            value={formData.estimated_hours}
                            onChange={e => setFormData({ ...formData, estimated_hours: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 8"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Notes</label>
                        <textarea
                            value={formData.assignment_notes}
                            onChange={e => setFormData({ ...formData, assignment_notes: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Special instructions for the stitcher..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Assigning...' : 'Assign Work'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
