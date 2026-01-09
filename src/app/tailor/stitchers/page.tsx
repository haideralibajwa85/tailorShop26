'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaUser, FaEdit, FaToggleOn, FaToggleOff, FaChartBar, FaTimes } from 'react-icons/fa';
import { stitcherAuth } from '../../../lib/stitcherAuth';
import { stitcherService } from '../../../lib/stitcherService';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import StitcherModal from '../../../components/StitcherModal';

export default function StitchersPage() {
    const router = useRouter();
    const [stitchers, setStitchers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStitcher, setEditingStitcher] = useState<any>(null);
    const [tailorId, setTailorId] = useState<string | null>(null);
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('role, id, organization_id')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'tailor' && profile?.role !== 'admin') {
                toast.error('Access denied');
                router.push('/');
                return;
            }

            setTailorId(user.id);
            setOrganizationId(profile.organization_id);
            loadStitchers(user.id);
        };

        checkUser();
    }, [router]);

    const loadStitchers = async (id: string) => {
        setIsLoading(true);
        const result = await stitcherAuth.getStitchersByTailor(id);
        if (result.success) {
            setStitchers(result.data || []);
        } else {
            toast.error('Failed to load stitchers');
        }
        setIsLoading(false);
    };

    const handleToggleStatus = async (stitcher: any) => {
        const newStatus = !stitcher.is_active;
        const result = newStatus
            ? await stitcherAuth.activateStitcher(stitcher.id)
            : await stitcherAuth.deactivateStitcher(stitcher.id);

        if (result.success) {
            toast.success(`Stitcher ${newStatus ? 'activated' : 'deactivated'}`);
            loadStitchers(tailorId!);
        } else {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Team Management</h1>
                    <p className="text-gray-600 mt-2 font-medium">Manage and track your production team members.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingStitcher(null);
                        setShowModal(true);
                    }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                    <FaPlus /> Register Stitcher
                </button>
            </header>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stitchers.map((stitcher) => (
                        <div key={stitcher.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center text-xl font-bold">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{stitcher.full_name}</h3>
                                        <p className="text-sm text-gray-500">{stitcher.username || stitcher.email?.split('@')[0]}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${stitcher.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stitcher.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Phone:</span>
                                    <span className="text-gray-900 font-medium">{stitcher.phone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Language:</span>
                                    <span className="text-gray-900 font-medium capitalize">{stitcher.language_preference || 'English'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => {
                                        setEditingStitcher(stitcher);
                                        setShowModal(true);
                                    }}
                                    className="flex-1 bg-slate-50 text-indigo-600 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaEdit /> Edit Profile
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(stitcher)}
                                    className={`p-2.5 rounded-xl transition-all ${stitcher.is_active ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                                    title={stitcher.is_active ? 'Deactivate' : 'Activate'}
                                >
                                    {stitcher.is_active ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                                </button>
                            </div>
                        </div>
                    ))}

                    {stitchers.length === 0 && (
                        <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaUser className="text-gray-400 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Stitchers Found</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start building your team by registering your first stitcher.</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
                            >
                                Register Now
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showModal && tailorId && organizationId && (
                <StitcherModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        loadStitchers(tailorId);
                    }}
                    stitcher={editingStitcher}
                    tailorId={tailorId}
                    organizationId={organizationId}
                />
            )}
        </div>
    );
}
