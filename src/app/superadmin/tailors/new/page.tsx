'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaBuilding, FaMapMarkerAlt, FaLanguage, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { organizationService, Organization } from '../../../../lib/organizationService';
import { createTailorAction } from '../../../actions/tailor';

export default function RegisterTailorPage() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Partial<Organization>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingOrgs, setIsFetchingOrgs] = useState(true);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        organization_id: '',
        address: '',
        gender: 'male',
        language_preference: 'en'
    });

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            const result = await organizationService.getAllActive();
            if (result.success) {
                setOrganizations(result.data || []);
            } else {
                toast.error('Failed to load organizations');
            }
        } catch (error) {
            console.error('Error loading organizations:', error);
            toast.error('An error occurred while loading organizations');
        } finally {
            setIsFetchingOrgs(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const result = await createTailorAction({
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                phone: formData.phone,
                organization_id: formData.organization_id,
                address: formData.address,
                gender: formData.gender,
                language_preference: formData.language_preference
            });

            if (result.success) {
                toast.success('Tailor registered successfully!');
                router.push('/superadmin/dashboard');
            } else {
                toast.error(result.error || 'Failed to register tailor');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/superadmin/dashboard" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-2">
                            <FaArrowLeft className="mr-2" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Register New Tailor</h1>
                        <p className="text-gray-600">Create a new tailor account and assign it to an organization.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <FaUser className="text-3xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Tailor Account Details</h2>
                                <p className="text-blue-50">Complete all fields to create the account.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                        placeholder="tailor@example.com"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaPhone className="text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Assign Organization</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaBuilding className="text-gray-400" />
                                    </div>
                                    <select
                                        required
                                        value={formData.organization_id}
                                        onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none"
                                        disabled={isFetchingOrgs}
                                    >
                                        <option value="">{isFetchingOrgs ? 'Loading organizations...' : 'Select Organization'}</option>
                                        {organizations.map((org) => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Language */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Preferred Language</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaLanguage className="text-gray-400" />
                                    </div>
                                    <select
                                        value={formData.language_preference}
                                        onChange={(e) => setFormData({ ...formData, language_preference: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none"
                                    >
                                        <option value="en">English</option>
                                        <option value="ur">Urdu (اردو)</option>
                                        <option value="ar">Arabic (العربية)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Gender</label>
                                <div className="flex gap-6 p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">Male</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={formData.gender === 'female'}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">Female</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Address (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 pt-3 flex items-start pointer-events-none">
                                    <FaMapMarkerAlt className="text-gray-400" />
                                </div>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="Enter physical address..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Progressing...
                                    </>
                                ) : (
                                    <>
                                        <FaSave /> Register Tailor
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
