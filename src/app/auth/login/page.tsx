'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getSupabaseClient } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getEmailByPhone } from '../../actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user is already logged in
    const checkSession = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase client is not initialized in LoginPage.');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Login page - User already logged in, checking role...');
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile?.role) {
            console.log('Login page - Redirecting to dashboard for role:', profile.role);
            router.push(`/${profile.role}/dashboard`);
          }
        }
      } catch (err) {
        console.error('Error checking session in LoginPage:', err);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        toast.error('System configuration error: Supabase client not initialized. Please check environment variables.');
        setIsLoading(false);
        return;
      }

      let loginEmail = email;

      // Check if the input is a phone number (heuristic: contains only digits, +, -, or space)
      const isPhoneNumber = /^[0-9+\-\s]+$/.test(email) && email.length > 5;

      if (isPhoneNumber) {
        const result = await getEmailByPhone(email);
        console.log('Login Debug - Phone Lookup Result:', result);


        if (!result.success || !result.email) {
          throw new Error(result.error || 'No account found with this phone number');
        }
        loginEmail = result.email;
      }

      // 1. Authenticate with Supabase Auth
      console.log('Login - Attempting auth with email:', loginEmail);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      console.log('Login - Auth response:', { authData, authError });

      if (authError) {
        console.error('Login - Auth error:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('Login - Auth successful, user:', authData.user);

        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify session was established
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        console.log('Login - Session verification after delay:', verifySession);

        if (!verifySession) {
          console.error('Login - Session not established after auth!');
          throw new Error('Session failed to establish');
        }

        // 2. Fetch user profile to get role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        console.log('Login - Profile from DB:', profile);
        console.log('Login - Profile error:', profileError);

        if (profileError) {
          console.error('Error fetching role:', profileError);
          // Fallback or detailed error handling
        }

        const role = profile?.role || 'customer';
        console.log('Login - Determined role:', role);

        // 3. Redirect based on role
        toast.success(t('validation.loginSuccess', { role }));

        // Force a small delay and then redirect
        setTimeout(() => {
          switch (role) {
            case 'superadmin':
              console.log('Login - Redirecting to superadmin dashboard');
              window.location.href = '/superadmin/dashboard';
              break;
            case 'admin':
              console.log('Login - Redirecting to admin dashboard');
              window.location.href = '/admin/dashboard';
              break;
            case 'tailor':
              console.log('Login - Redirecting to tailor dashboard');
              window.location.href = '/tailor/dashboard';
              break;
            case 'stitcher':
              console.log('Login - Redirecting to stitcher dashboard');
              window.location.href = '/stitcher/dashboard';
              break;
            case 'customer':
            default:
              console.log('Login - Redirecting to customer dashboard');
              window.location.href = '/customer/dashboard';
              break;
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        toast.error(t('validation.invalidCredentials'));
      } else if (error.message.includes('Email not confirmed')) {
        toast.error(t('validation.emailNotConfirmed'));
      } else {
        toast.error(error.message || t('validation.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Pane: Branding and Welcome Message */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-emerald-600 items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">{t('auth.welcomeBack')}</h1>
          <p className="text-xl font-light max-w-md">
            {t('auth.welcomeSubtitle')}
          </p>
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">{t('auth.signIn')}</h2>
            <p className="text-gray-600">{t('auth.enterCredentials')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')} / {t('auth.phoneNumber')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
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
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  suppressHydrationWarning
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-600 rounded focus:ring-blue-500"
                  suppressHydrationWarning
                />
                <span className="ml-2 text-sm text-gray-700">{t('auth.rememberMe')}</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}