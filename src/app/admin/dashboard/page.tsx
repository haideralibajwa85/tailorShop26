'use client';

import { FaUsers, FaClipboardList, FaCut, FaChartLine, FaBoxOpen } from 'react-icons/fa';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LogoutButton from '../../../components/LogoutButton';

const StatCard = ({ href, icon, title, description, gradient }: { href: string; icon: React.ReactNode; title: string; description: string; gradient: string; }) => (
    <Link href={href} className={`group block p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${gradient}`}>
        <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                {icon}
            </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
    </Link>
);

export default function AdminDashboard() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-10 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{t('dashboard.admin.title')}</h1>
                    <p className="text-gray-600 mt-2">{t('dashboard.admin.subtitle')}</p>
                </div>
                <LogoutButton />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                <StatCard
                    href="/admin/orders"
                    icon={<FaClipboardList className="text-white text-xl" />}
                    title={t('dashboard.admin.cards.orders.title')}
                    description={t('dashboard.admin.cards.orders.desc')}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    href="/admin/staff"
                    icon={<FaUsers className="text-white text-xl" />}
                    title={t('dashboard.admin.cards.staff.title')}
                    description={t('dashboard.admin.cards.staff.desc')}
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                    href="/admin/categories"
                    icon={<FaBoxOpen className="text-white text-xl" />}
                    title={t('dashboard.admin.cards.categories.title')}
                    description={t('dashboard.admin.cards.categories.desc')}
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
                <StatCard
                    href="/admin/saudi-wear"
                    icon={<FaCut className="text-white text-xl" />}
                    title={t('dashboard.admin.cards.saudiWear.title')}
                    description={t('dashboard.admin.cards.saudiWear.desc')}
                    gradient="bg-gradient-to-br from-amber-500 to-amber-600"
                />
                <StatCard
                    href="/admin/reports"
                    icon={<FaChartLine className="text-white text-xl" />}
                    title={t('dashboard.admin.cards.reports.title')}
                    description={t('dashboard.admin.cards.reports.desc')}
                    gradient="bg-gradient-to-br from-red-500 to-red-600"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.admin.systemOverview')}</h2>
                <p className="text-gray-600">
                    {t('dashboard.admin.systemOverviewDesc')}
                </p>
            </div>
        </div>
    );
}
