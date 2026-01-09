'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronLeft, FaSave } from 'react-icons/fa';
import { organizationService } from '../../../../../lib/organizationService';
import { supabase } from '../../../../../lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function EditOrganizationPage() {
    const router = useRouter();
    const params = useParams();
    const orgId = params.id as string;

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        business_name: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        subscription_plan: 'basic',
        is_active: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadOrganization();
    }, [orgId]);

    const loadOrganization = async () => {
        try {
            const { data: org, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', orgId)
                .single();

            if (error) throw error;
            if (org) {
                setFormData({
                    name: org.name || '',
                    slug: org.slug || '',
                    business_name: org.business_name || '',
                    business_address: org.business_address || '',
                    business_phone: org.business_phone || '',
                    business_email: org.business_email || '',
                    subscription_plan: org.subscription_plan || 'basic',
                    is_active: org.is_active ?? true
                });
            }
        } catch (error: any) {
            toast.error('Failed to load organization');
            router.push('/superadmin/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const { success, error } = await organizationService.update(orgId, formData);

            if (success) {
                toast.success('Organization updated successfully!');
                router.push('/superadmin/dashboard');
            } else {
                throw new Error(error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update organization');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading organization details...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-3xl mx-auto">
                <Link href="/superadmin/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
                    <FaChevronLeft className="mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                        <h1 className="text-3xl font-bold">Edit Organization</h1>
                        <p className="mt-2 text-blue-100 opacity-90">Update details for {formData.name}</p>
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
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Royal Stitchers"
                                        required
                                    />
                                </div>
                            </div>

                            {/* URL Slug */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Slug</label>
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
                            <div>
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

                            {/* Active Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.is_active ? 'active' : 'inactive'}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive (Disabled)</option>
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
                                disabled={isSaving}
                                className={`w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                <FaSave />
                                <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
