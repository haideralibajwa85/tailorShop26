'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaMobileAlt, FaLock, FaLanguage, FaMapMarkerAlt, FaBuilding, FaUserTag, FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';
import { organizationService, Organization } from '../../../lib/organizationService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    language: 'en',
    gender: 'male',
    address: '',
    organizationId: '',
    role: 'tailor' as 'tailor' | 'customer',
  });
  const [mounted, setMounted] = useState(false);
  const [organizations, setOrganizations] = useState<Partial<Organization>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
    loadActiveOrganizations();
  }, []);

  const loadActiveOrganizations = async () => {
    const result = await organizationService.getAllActive();
    if (result.success) {
      setOrganizations(result.data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('validation.passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);
    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            organization_id: formData.organizationId,
            role: formData.role,
            phone: formData.phoneNumber
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert detailed profile into public.users table
        const { error: profileError } = await supabase
          .from('users')
          .upsert([
            {
              id: authData.user.id,
              email: formData.email,
              full_name: formData.fullName,
              phone: formData.phoneNumber,
              language_preference: formData.language,
              gender: formData.gender,
              address: formData.address,
              organization_id: formData.organizationId,
              role: formData.role
            }
          ]);

        if (profileError) {
          // If profile creation fails, we might want to clean up the auth user or log it
          console.error('Error creating profile:', profileError);
          toast.error(t('validation.profileSetupFailed'));
        } else {
          toast.success(t('validation.registrationSuccess'));
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || t('validation.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-xl text-blue-600 font-semibold">{t('common.loading')}</div>
    </div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Pane: Branding and Welcome Message */}
      <div className="hidden lg:flex w-1/3 bg-gradient-to-br from-blue-600 to-emerald-600 items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">{t('auth.createAccountTitle')}</h1>
          <p className="text-xl font-light max-w-md">
            {t('auth.createAccountSubtitle')}
          </p>
        </div>
      </div>

      {/* Right Pane: Registration Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">{t('auth.signUpTitle')}</h2>
            <p className="text-gray-600">{t('auth.signUpSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.fullName')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input suppressHydrationWarning type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder={t('auth.fullNamePlaceholder')} required />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input suppressHydrationWarning type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder={t('auth.emailPlaceholder')} required />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.phoneNumber')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMobileAlt className="text-gray-400" />
                  </div>
                  <input suppressHydrationWarning type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder={t('auth.phonePlaceholder')} required />
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.language')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLanguage className="text-gray-400" />
                  </div>
                  <select id="language" name="language" value={formData.language} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none">
                    <option value="en">English</option>
                    <option value="ur">اردو</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>

              {/* Organization Selection */}
              <div>
                <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-2">Select Organization *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <select
                    id="organizationId"
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                    required
                  >
                    <option value="">Choose your shop...</option>
                    {organizations.map((org: any) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">I am a... *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserTag className="text-gray-400" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                    required
                  >
                    <option value="tailor">Tailor (Working)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('auth.passwordCreatePlaceholder')}
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('auth.passwordConfirmPlaceholder')}
                    required
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
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.gender')}</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="radio" className="form-radio text-blue-600 focus:ring-blue-500" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} />
                  <span className="ml-2 text-gray-700">{t('auth.male')}</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" className="form-radio text-blue-600 focus:ring-blue-500" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} />
                  <span className="ml-2 text-gray-700">{t('auth.female')}</span>
                </label>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">{t('auth.address')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <textarea id="address" name="address" value={formData.address} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder={t('auth.addressPlaceholder')} rows={3} />
              </div>
            </div>

            <div className="flex items-start">
              <input id="terms" name="terms" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1" required />
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  {t('auth.agreeTo')} <a href="#" className="text-blue-600 hover:underline">{t('auth.termsOfService')}</a> {t('common.and')} <a href="#" className="text-blue-600 hover:underline">{t('auth.privacyPolicy')}</a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}