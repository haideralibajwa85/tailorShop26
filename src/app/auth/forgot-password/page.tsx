'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { getSupabaseClient } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const supabase = getSupabaseClient();
            if (!supabase) {
                toast.error('Database connection unavailable');
                setIsLoading(false);
                return;
            }
            
            const redirectTo = `${window.location.origin}/auth/reset-password`;
            console.log('Attempting password reset for:', email);
            console.log('Redirect URL:', redirectTo);

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (error) {
                console.error('Supabase resetPasswordForEmail error:', error);
                throw error;
            }

            setEmailSent(true);
            toast.success(t('auth.resetLinkSent'));
        } catch (error: any) {
            console.error('Full catch block error:', error);
            toast.error(error.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Pane: Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-emerald-600 items-center justify-center p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="z-10 text-center">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">{t('auth.resetPasswordTitle')}</h1>
                    <p className="text-xl font-light max-w-md">
                        {t('auth.resetPasswordSubtitle')}
                    </p>
                </div>
            </div>

            {/* Right Pane: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">{t('auth.resetPassword')}</h2>
                        <p className="text-gray-600">{t('auth.resetPasswordSubtitle')}</p>
                    </div>

                    {!emailSent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('auth.email')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder={t('auth.emailPlaceholder')}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? t('common.loading') : t('auth.sendResetLink')}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <div className="text-green-600 text-5xl mb-4">✓</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {t('auth.resetLinkSent')}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center text-blue-600 font-medium hover:underline"
                        >
                            <FaArrowLeft className="mr-2" />
                            {t('auth.backToLogin')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
