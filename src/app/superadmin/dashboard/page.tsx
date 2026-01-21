'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaBuilding, FaUsers, FaChartLine, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserTie, FaTachometerAlt } from 'react-icons/fa';
import { organizationService } from '../../../lib/organizationService';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function SuperadminDashboard() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalOrganizations: 0,
        totalUsers: 0,
        activeSubscriptions: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkSuperadmin();
        loadDashboardData();
    }, []);

    const checkSuperadmin = async () => {
        console.log('Dashboard - Starting superadmin check');
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Dashboard - Auth user:', user);

        if (!user) {
            console.log('Dashboard - No user found, redirecting to login');
            router.push('/auth/login');
            return;
        }

        console.log('Dashboard - Looking up profile for user ID:', user.id);
        const { data: profile, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('Dashboard - Profile from DB:', profile);
        console.log('Dashboard - Profile error:', error);

        if (profile?.role !== 'superadmin') {
            console.log('Dashboard - Not superadmin, role is:', profile?.role);
            toast.error('Unauthorized access');
            router.push('/');
        } else {
            console.log('Dashboard - Superadmin access granted');
        }
    };

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Load organizations
            const { data: orgs, error: orgsError } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: false });

            if (orgsError) throw orgsError;
            setOrganizations(orgs || []);

            // Load total users
            const { count: userCount, error: userError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            if (userError) throw userError;

            setStats({
                totalOrganizations: orgs?.length || 0,
                totalUsers: userCount || 0,
                activeSubscriptions: orgs?.filter((o: any) => o.subscription_status === 'active').length || 0
            });
        } catch (error: any) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                            <FaTachometerAlt className="mr-4 text-blue-600" />
                            Superadmin Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">Manage all tailor shop organizations across the platform</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/superadmin/tailors/new')}
                            className="bg-white text-gray-700 px-6 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                        >
                            <FaUserTie className="text-emerald-500" /> Register Tailor
                        </button>
                        <button
                            onClick={() => router.push('/superadmin/organizations/new')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            + New Organization
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Shops</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrganizations}</h3>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <FaBuilding className="text-blue-600 text-2xl" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h3>
                        </div>
                        <div className="bg-emerald-100 p-4 rounded-lg">
                            <FaUsers className="text-emerald-600 text-2xl" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Plans</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.activeSubscriptions}</h3>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-lg">
                            <FaChartLine className="text-purple-600 text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Organizations Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Registered Organizations</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">Loading organizations...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Shop Name</th>
                                        <th className="px-6 py-4 font-semibold">Slug</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Plan</th>
                                        <th className="px-6 py-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {organizations.map((org: any) => (
                                        <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{org.name}</div>
                                                <div className="text-xs text-gray-500">{org.business_email || 'No email provided'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{org.slug}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${org.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {org.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm uppercase font-medium">{org.subscription_plan}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => router.push(`/superadmin/organizations/${org.id}/edit`)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">Manage</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {organizations.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No organizations found. Click "New Organization" to create your first one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
