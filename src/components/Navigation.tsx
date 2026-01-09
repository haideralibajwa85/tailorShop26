'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { FaUserCircle, FaBars, FaTimes, FaCut, FaSignOutAlt } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Navigation = () => {
  const { currentUser, isRTL, setCurrentUser } = useAppContext();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setCurrentUser(null);
      toast.success('Logged out successfully');
      router.push('/auth/login');
      // Remove the forced reload as it can cause redirect loops
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout: ' + (error.message || 'Unknown error'));
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getDashboardRoute = (role: string | undefined | null) => {
    switch (role) {
      case 'superadmin':
        return '/superadmin/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'tailor':
        return '/tailor/dashboard';
      case 'customer':
        return '/customer/dashboard';
      default:
        return '/';
    }
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    if (!currentUser) {
      return [
        { name: 'home', label: 'navigation.home', href: '/' },
      ];
    }

    switch (currentUser.role) {
      case 'admin':
        return [
          { name: 'Orders', label: 'navigation.orders', href: '/admin/orders' },
          { name: 'Categories', label: 'navigation.categories', href: '/admin/categories' },
          { name: 'Staff', label: 'navigation.staff', href: '/admin/staff' },
          { name: 'Reports', label: 'navigation.reports', href: '/admin/reports' },
        ];
      case 'tailor':
        return [
          { name: 'Assigned Orders', label: 'navigation.orders', href: '/tailor/orders' },
        ];
      case 'customer':
        return [
          { name: 'My Orders', label: 'navigation.orders', href: '/customer/orders' },
          { name: 'New Order', label: 'navigation.newOrder', href: '/customer/orders/new' },
        ];
      default:
        return [
          { name: 'Home', label: 'navigation.home', href: '/' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className={`bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <FaCut className="text-white text-lg" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Tailor<span className="text-blue-600">Shop</span></span>
              </div>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${pathname === item.href
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 h-20`}
                >
                  {t(item.label)}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative flex items-center gap-4">
                <div className="flex flex-col items-end mr-4">
                  <span className="text-gray-900 text-sm font-bold truncate max-w-[120px]">{currentUser.full_name}</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={getDashboardRoute(currentUser.role)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
                  >
                    Back to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors duration-200"
                    title="Logout"
                    type="button"
                  >
                    <FaSignOutAlt className="text-sm" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-medium text-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-xl absolute w-full z-40">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${pathname === item.href
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  } block px-3 py-3 rounded-lg text-base font-medium transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t(item.label)}
              </Link>
            ))}
            {currentUser && (
              <Link
                href={getDashboardRoute(currentUser.role)}
                className="block px-3 py-3 rounded-lg text-base font-bold text-blue-600 bg-blue-50 mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Back to Dashboard
              </Link>
            )}
            <div className="border-t border-gray-100 my-2 pt-2">
              <div className="mb-4">
                <LanguageSwitcher />
              </div>
              {!currentUser ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/auth/login"
                    className="w-full text-center text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="w-full text-center bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-medium py-3 rounded-lg shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-gray-900">{currentUser.full_name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg"
                    type="button"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;