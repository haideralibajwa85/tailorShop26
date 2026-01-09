'use client';

import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function LogoutButton() {
    const router = useRouter();
    const { t } = useTranslation();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success(t('auth.logout') + ' successful');
            router.push('/auth/login');
        } catch (error: any) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-white text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200 shadow-sm"
        >
            <FaSignOutAlt />
            <span>{t('auth.logout')}</span>
        </button>
    );
}
