'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronLeft } from 'react-icons/fa';
import { organizationService } from '../../../../lib/organizationService';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function NewOrganizationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        business_name: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        subscription_plan: 'basic'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const result = await organizationService.create(formData, user.id);

            if (result.success) {
                toast.success('Organization created successfully!');
                router.push('/superadmin/dashboard');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create organization');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        setFormData({ ...formData, name, slug });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-3xl mx-auto">
                <Link href="/superadmin/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
                    <FaChevronLeft className="mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                        <h1 className="text-3xl font-bold">Create New Organization</h1>
                        <p className="mt-2 text-blue-100 opacity-90">Set up a new tailor shop on the platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shop Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaBuilding className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Royal Stitchers"
                                        required
                                    />
                                </div>
                            </div>

                            {/* URL Slug */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Slug (Auto-generated)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaGlobe className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                                        placeholder="royal-stitchers"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">This will be used in the URL for this shop.</p>
                            </div>

                            {/* Business Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.business_email}
                                        onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="contact@shop.com"
                                    />
                                </div>
                            </div>

                            {/* Business Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Phone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaPhone className="text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={formData.business_phone}
                                        onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            {/* Subscription Plan */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subscription Plan</label>
                                <select
                                    value={formData.subscription_plan}
                                    onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                                >
                                    <option value="basic">Basic (Limited Orders)</option>
                                    <option value="professional">Professional (Unlimited Orders)</option>
                                    <option value="enterprise">Enterprise (Custom Features)</option>
                                </select>
                            </div>

                            {/* Business Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                    </div>
                                    <textarea
                                        value={formData.business_address}
                                        onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Enter full physical address..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? 'Creating Organization...' : 'Create Organization'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
