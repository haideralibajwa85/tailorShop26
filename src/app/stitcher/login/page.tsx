'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { stitcherAuth } from '../../../lib/stitcherAuth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function StitcherLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await stitcherAuth.login(formData.username, formData.password);

        if (result.success) {
            // Store stitcher info in session storage
            sessionStorage.setItem('stitcher', JSON.stringify(result.stitcher));
            toast.success('Login successful!');
            router.push('/stitcher/dashboard');
        } else {
            toast.error(result.error || 'Login failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Pane: Branding */}
            <div className="hidden lg:flex w-1/3 bg-gradient-to-br from-purple-600 to-blue-600 items-center justify-center p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="z-10 text-center">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Stitcher Portal</h1>
                    <p className="text-xl font-light max-w-md">
                        Access your assigned work and track your progress
                    </p>
                </div>
            </div>

            {/* Right Pane: Login Form */}
            <div className="w-full lg:w-2/3 flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">Stitcher Login</h2>
                        <p className="text-gray-600">Enter your UserID to access your assigned work</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* UserID */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                UserID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
                                    placeholder="Enter your UserID"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                    required
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3.5 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Need help?{' '}
                            <span className="text-purple-600 font-medium">Contact your tailor</span>
                        </p>
                        <div className="mt-4">
                            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-700">
                                ← Back to main login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
