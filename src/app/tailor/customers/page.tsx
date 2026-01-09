'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FaSearch, FaUserPlus, FaUser, FaPhone, FaEnvelope, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function TailorCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('No user found, redirecting to login');
                window.location.href = '/auth/login';
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('organization_id, role')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Profile error:', profileError);
                toast.error('Failed to load profile: ' + profileError.message);
                setLoading(false);
                return;
            }

            if (!profile?.organization_id) {
                console.log('No organization_id found');
                toast.error('You must be part of an organization to view customers');
                setLoading(false);
                return;
            }

            console.log('Fetching customers for organization:', profile.organization_id);

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'customer')
                .eq('organization_id', profile.organization_id)
                .order('full_name', { ascending: true });

            if (error) {
                console.error('Customer fetch error:', error);
                throw error;
            }

            console.log('Customers loaded:', data?.length || 0);
            setCustomers(data || []);
        } catch (error: any) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center bg-slate-50 min-h-screen">Loading customers...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Customer Management</h1>
                    <p className="text-gray-600 mt-2 font-medium">View and register your shop's customers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/tailor/customers/new"
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95"
                    >
                        <FaUserPlus /> Register New Customer
                    </Link>
                    <Link href="/tailor/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, phone, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                        Showing {filteredCustomers.length} customers
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-gray-600 text-sm uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                                    {customer.full_name?.charAt(0) || <FaUser />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{customer.full_name}</p>
                                                    <p className="text-xs text-gray-500">ID: {customer.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-600 gap-2">
                                                <FaEnvelope className="text-gray-400 text-xs" />
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-600 gap-2">
                                                <FaPhone className="text-gray-400 text-xs" />
                                                {customer.phone || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/tailor/orders/new?customerId=${customer.id}`}
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Create Order <FaChevronRight size={10} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
