'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaPhone, FaLock, FaUserTag, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';
import { stitcherService } from '../../../../lib/stitcherService';
import { toast } from 'react-hot-toast';

export default function NewStitcherPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [tailorInfo, setTailorInfo] = useState<{ id: string, organization_id: string } | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchTailorInfo();
    }, []);

    const fetchTailorInfo = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('users')
                .select('id, organization_id')
                .eq('id', user.id)
                .single();

            if (profile) {
                setTailorInfo(profile);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tailorInfo) {
            toast.error('Session expired. Please login again.');
            return;
        }

        setIsLoading(true);
        const result = await stitcherService.createStitcher({
            username: formData.username,
            password: formData.password,
            full_name: formData.fullName,
            phone: formData.phone,
            tailor_id: tailorInfo.id,
            organization_id: tailorInfo.organization_id
        });

        if (result.success) {
            toast.success('Stitcher registered successfully!');
            router.push('/tailor/dashboard');
        } else {
            toast.error(result.error || 'Failed to register stitcher');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <Link href="/tailor/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors">
                    <FaArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                        <h1 className="text-3xl font-bold">Register New Stitcher</h1>
                        <p className="mt-2 opacity-90 text-blue-100">Add a member to your stitching team</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Enter stitcher's full name"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhone className="text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    placeholder="+92 3XX XXXXXXX"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* UserID (Username) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">UserID (For Login)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUserTag className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="e.g. worker_ali"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500 italic">The stitcher will use this to sign in.</p>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Login Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Min. 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transform transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Registering...' : 'Register Stitcher'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
