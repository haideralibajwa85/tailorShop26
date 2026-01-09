'use client';

import { useState, useEffect } from 'react';
import { FaTshirt, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import LogoutButton from '../../../components/LogoutButton';
import { supabase } from '../../../lib/supabase';
import { workAssignmentService } from '../../../lib/workAssignmentService';
import { toast } from 'react-hot-toast';

export default function StitcherDashboard() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ active: 0, completedToday: 0 });

    useEffect(() => {
        loadStitcherData();
    }, []);

    const loadStitcherData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Assignments
            const { data } = await workAssignmentService.getAssignmentsByStitcher(user.id);
            if (data) {
                setAssignments(data);

                // Simple stats
                const active = data.filter((a: any) => a.status !== 'completed').length;
                const completed = data.filter((a: any) => a.status === 'completed').length;
                setStats({ active, completedToday: completed });
            }
        } catch (error) {
            console.error('Error loading stitcher dashboard:', error);
            toast.error('Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProgress = async (id: string, currentProgress: number) => {
        const newProgress = Math.min(currentProgress + 25, 100);
        const { success, error } = await workAssignmentService.updateProgress(id, newProgress);

        if (success) {
            toast.success(newProgress === 100 ? 'Order Finished! Well done.' : `Progress updated to ${newProgress}%`);
            loadStitcherData();
        } else {
            toast.error(error || 'Update failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Worker Portal</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <p className="text-gray-600 text-sm font-medium uppercase tracking-wider">Live Task List</p>
                    </div>
                </div>
                <LogoutButton />
            </header>

            {/* Dash Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl shadow-lg text-white">
                    <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">Active Now</p>
                    <p className="text-4xl font-black">{stats.active}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Completed</p>
                        <p className="text-2xl font-black text-gray-900">{stats.completedToday}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 px-2">
                <FaTshirt className="text-indigo-600" /> Current Assignments
            </h2>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4 font-medium tracking-wide">Syncing your work...</p>
                    </div>
                ) : assignments.length > 0 ? assignments.map((asgn: any) => (
                    <div key={asgn.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all duration-300 transform border-l-8 border-l-indigo-600">
                        <div className="flex gap-5">
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-3xl text-slate-300">
                                <FaTshirt />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">
                                    {asgn.orders?.clothing_type} <span className="text-indigo-600 ml-1">#{asgn.orders?.order_id}</span>
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{asgn.orders?.fabric_type}</span>
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{asgn.orders?.color}</span>
                                    {asgn.orders?.quantity > 1 && (
                                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">Qty: {asgn.orders?.quantity}</span>
                                    )}
                                </div>
                                {asgn.orders?.custom_notes && (
                                    <div className="mt-4 flex items-start gap-2 text-sm bg-amber-50 text-amber-800 p-3 rounded-2xl border border-amber-100 shadow-sm italic font-medium">
                                        <FaExclamationCircle className="mt-1 text-amber-500 flex-shrink-0" />
                                        <span>{asgn.orders.custom_notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 md:min-w-[280px]">
                            <div className="w-full">
                                <div className="flex justify-between text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">
                                    <span>Work Progress</span>
                                    <span className="text-indigo-600">{asgn.progress_percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out shadow-sm ${asgn.progress_percentage === 100 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                            asgn.progress_percentage > 50 ? 'bg-gradient-to-r from-blue-400 to-indigo-600' :
                                                'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                            }`}
                                        style={{ width: `${asgn.progress_percentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleUpdateProgress(asgn.id, asgn.progress_percentage)}
                                disabled={asgn.progress_percentage === 100}
                                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${asgn.progress_percentage === 100
                                    ? 'bg-green-50 text-green-600 cursor-default border border-green-200'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 shadow-xl'
                                    }`}
                            >
                                {asgn.progress_percentage === 0 ? '▶ Start Now' :
                                    asgn.progress_percentage < 100 ? '↻ Log Progress' : '✓ Done'}
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white rounded-3xl py-20 text-center border-2 border-dashed border-gray-200 shadow-inner">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-green-400 shadow-sm">
                            <FaCheckCircle />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">You're All Done!</h3>
                        <p className="text-gray-500 mt-2 font-medium">Waiting for the tailor to assign new work.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
