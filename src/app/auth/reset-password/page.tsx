'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Check if we have a valid session from the reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsValidToken(true);
            } else {
                toast.error(t('auth.invalidResetLink'));
                setTimeout(() => router.push('/auth/login'), 2000);
            }
        };

        checkSession();
    }, [router, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error(t('validation.passwordsDoNotMatch'));
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            toast.success(t('auth.passwordResetSuccess'));

            // Sign out and redirect to login
            await supabase.auth.signOut();
            setTimeout(() => router.push('/auth/login'), 1500);
        } catch (error: any) {
            console.error('Password update error:', error);
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Pane: Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-emerald-600 items-center justify-center p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="z-10 text-center">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">{t('auth.setNewPassword')}</h1>
                    <p className="text-xl font-light max-w-md">
                        Choose a strong password to secure your account.
                    </p>
                </div>
            </div>

            {/* Right Pane: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">{t('auth.resetPassword')}</h2>
                        <p className="text-gray-600">Enter your new password below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('auth.newPassword')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('auth.confirmPassword')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? t('common.loading') : t('auth.resetPassword')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
