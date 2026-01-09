'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowLeft, FaSave } from 'react-icons/fa';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { createCustomerAction } from '../../../actions/customer';

export default function AddCustomerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [tailorProfile, setTailorProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        password: 'Customer@123', // Default password for simplicity, can be changed
    });

    useEffect(() => {
        fetchTailorProfile();
    }, []);

    const fetchTailorProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            setTailorProfile(data);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!tailorProfile?.organization_id) {
                throw new Error('You must be part of an organization to register customers.');
            }

            // 1. Create a dummy or real auth user if needed, 
            // but for simplicity in this workflow, we might just insert into public.users
            // if we don't need them to log in immediately without a proper invite.
            // HOWEVER, the requirement is they CAN login with phone number.
            // So we NEED an auth entry.

            // Generate a placeholder email if not provided
            const finalizedEmail = formData.email || `${formData.phone}@customer.tailorshop.com`;

            // Note: Supabase signUp might not work for another user easily without Admin API
            // For now, let's assume we use a specialized edge function or just insert into public.users 
            // and handle auth linking if they ever try to log in (or use service role).

            // To fulfill the "login with phone" requirement, we really need them in auth.users.
            // Since this is a browser-based agent, I'll use the public signUp which might sign the tailor out.
            // BETTER: Direct insert into public.users for now and prompt user about auth complexity.
            // BUT wait, Supabase Auth user creation usually requires service role from client.

            // Let's try the profile first.
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('phone', formData.phone)
                .single();

            if (existingUser) {
                toast.error('A customer with this phone number already exists.');
                setLoading(false);
                return;
            }

            // Call server action to create user (Auth + Profile)
            const result = await createCustomerAction({
                full_name: formData.full_name,
                phone: formData.phone,
                email: finalizedEmail,
                address: formData.address,
                organization_id: tailorProfile.organization_id
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success('Customer registered successfully!');
            router.push('/tailor/customers');
        } catch (error: any) {
            console.error('Error adding customer:', error);
            toast.error(error.message || 'Failed to register customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/tailor/customers" className="p-3 bg-white rounded-xl shadow-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <FaArrowLeft />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Register New Customer</h1>
                            <p className="text-gray-600 font-medium">Add a new customer to your shop.</p>
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="full_name"
                                        required
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaPhone className="text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="+1234567890"
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address (Optional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">If empty, a system ID will be generated</p>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 pt-3 flex items-start pointer-events-none">
                                    <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                </div>
                                <textarea
                                    name="address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Street, City, Postal Code"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95"
                            >
                                <FaSave /> {loading ? 'Registering...' : 'Register Customer'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-8 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
