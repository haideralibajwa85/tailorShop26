'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaClipboardList, FaPlus, FaChartBar, FaClock, FaCheck, FaExclamationTriangle, FaSignOutAlt, FaBox } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

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

const OrderRow = ({ orderId, category, status, expectedDate }: { orderId: string; category: string; status: string; expectedDate: string; }) => {
  const getStatusDetails = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { icon: <FaCheck className="mr-1.5" />, color: 'bg-green-100 text-green-800' };
      case 'in_stitching':
      case 'institching':
        return { icon: <FaExclamationTriangle className="mr-1.5" />, color: 'bg-blue-100 text-blue-800' };
      case 'pending':
      default:
        return { icon: <FaClock className="mr-1.5" />, color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  const { icon, color } = getStatusDetails(status);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{orderId}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{category}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
          {icon}
          {status?.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {expectedDate ? new Date(expectedDate).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Link href={`/customer/orders/${orderId}`} className="text-blue-600 hover:text-blue-800 hover:underline">
          View Details
        </Link>
      </td>
    </tr>
  );
};

export default function CustomerDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Customer Dashboard - Starting data fetch');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Customer Dashboard - Auth user:', user);
      
      if (!user) {
        console.log('Customer Dashboard - No user found, redirecting to login');
        router.push('/auth/login');
        return;
      }

      // Fetch Profile
      console.log('Customer Dashboard - Looking up profile for user ID:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('Customer Dashboard - Profile from DB:', profile);
      console.log('Customer Dashboard - Profile error:', profileError);
      setUserProfile(profile);

      // Fetch Recent Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Customer Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {userProfile?.full_name || 'Customer'}! Here's what's happening with your orders.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 text-gray-700">
              <FaUser className="text-blue-600" />
              <span className="font-medium">{userProfile?.full_name || 'Customer'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            href="/customer/profile"
            icon={<FaUser className="text-white text-xl" />}
            title="My Profile"
            description="View and update your profile"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            href="/customer/orders"
            icon={<FaClipboardList className="text-white text-xl" />}
            title="My Orders"
            description="Track your current and past orders"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            href="#"
            icon={<FaChartBar className="text-white text-xl" />}
            title="Analytics"
            description="View your order statistics"
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-gray-600 mt-1">Track the status of your recent orders</p>
            </div>
            <Link href="/customer/orders" className="text-blue-600 hover:text-blue-800 font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      orderId={order.order_id}
                      category={order.category}
                      status={order.status}
                      expectedDate={order.expected_completion_date}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <FaBox className="mx-auto text-4xl mb-4 text-gray-200" />
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {orders.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{orders.length}</span> of{' '}
                <span className="font-medium">{orders.length}</span> results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}