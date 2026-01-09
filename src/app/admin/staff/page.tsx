'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FaUserShield, FaUserTie, FaUser, FaEdit } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AdminStaffPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('role');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId: string, currentRole: string) => {
        const newRole = window.prompt(`Enter new role for user (admin, tailor, customer). Current: ${currentRole}`, currentRole);

        if (!newRole || newRole === currentRole) return;

        if (!['admin', 'tailor', 'customer'].includes(newRole.toLowerCase())) {
            toast.error('Invalid role. Must be: admin, tailor, or customer');
            return;
        }

        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole.toLowerCase() })
                .eq('id', userId);

            if (error) throw error;
            toast.success('User role updated');
            fetchUsers(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || 'Failed to update role');
        }
    };

    // Helper to get icon based on role
    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <FaUserShield className="text-red-500" />;
            case 'tailor': return <FaUserTie className="text-blue-500" />;
            default: return <FaUser className="text-green-500" />;
        }
    };

    if (loading) return <div className="p-8 text-center bg-slate-50 min-h-screen pt-20">Loading staff & users...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff & Users</h1>
                    <p className="text-gray-600">Manage user roles and staff details</p>
                </div>
                <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
                    Back to Dashboard
                </Link>
            </header>

            <div className="grid gap-4 max-w-4xl mx-auto">
                {users.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gray-50 rounded-full">
                                {getRoleIcon(user.role)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{user.full_name || 'No Name'}</h3>
                                <div className="text-sm text-gray-500 flex flex-col">
                                    <span>{user.email}</span>
                                    <span className="text-xs text-gray-400">{user.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                 ${user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                    user.role === 'tailor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {user.role}
                            </span>
                            <button
                                onClick={() => updateUserRole(user.id, user.role)}
                                className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                                title="Edit Role"
                            >
                                <FaEdit size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
