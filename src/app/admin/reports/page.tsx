'use client';
import Link from 'next/link';
import { FaChartBar } from 'react-icons/fa';

export default function AdminReportsPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-red-100 p-6 rounded-full text-red-600 mb-6">
                <FaChartBar size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Reports</h1>
            <p className="text-gray-600 max-w-md mb-8">
                Financial and order volume reports will be visualized here using charts and data tables.
            </p>
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
                Return to Dashboard
            </Link>
        </div>
    );
}
