'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChartBar, FaUserGraduate, FaClock, FaCheckCircle, FaStar, FaChevronLeft } from 'react-icons/fa';
import { workAssignmentService } from '../../../../lib/workAssignmentService';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function StitcherReportsPage() {
    const [stats, setStats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const result = await workAssignmentService.getTailorStitcherStats(user.id);
            if (result.success) {
                setStats(result.data || []);
            }
        } catch (error) {
            toast.error('Failed to load performance reports');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/tailor/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
                    <FaChevronLeft className="mr-2" />
                    Back to Dashboard
                </Link>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                            <FaChartBar className="mr-4 text-emerald-600" />
                            Stitcher Performance Reports
                        </h1>
                        <p className="text-gray-600 mt-2">Track productivity and quality metrics for your stitchers</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center p-20 text-gray-500">Generating reports...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stats.map((stitcher) => (
                            <div key={stitcher.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 border-b border-gray-50 bg-slate-50/50">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <FaUserGraduate className="text-emerald-600 text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{stitcher.full_name}</h3>
                                            <p className="text-sm text-gray-500">{stitcher.specialization || 'General'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center">
                                            <FaCheckCircle className="mr-2 text-emerald-500" /> Completed
                                        </span>
                                        <span className="font-bold text-gray-900">{stitcher.completed_count}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center">
                                            <FaClock className="mr-2 text-blue-500" /> In Progress
                                        </span>
                                        <span className="font-bold text-gray-900">{stitcher.in_progress_count}</span>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500 uppercase">Quality Rating</span>
                                            <div className="flex text-yellow-400">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FaStar key={star} className={star <= (stitcher.avg_rating || 0) ? 'fill-current' : 'text-gray-200'} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full"
                                                style={{ width: `${(stitcher.completed_count / (stitcher.total_count || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-right">
                                            Completion Rate: {Math.round((stitcher.completed_count / (stitcher.total_count || 1)) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {stats.length === 0 && (
                            <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-dashed border-gray-300">
                                <p className="text-gray-500">No performance data available yet. Assing work to see reports.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
