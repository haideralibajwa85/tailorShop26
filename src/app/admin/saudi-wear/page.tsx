'use client';
import Link from 'next/link';
import { FaTools } from 'react-icons/fa';

export default function AdminSaudiWearPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-amber-100 p-6 rounded-full text-amber-600 mb-6">
                <FaTools size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saudi Wear Management</h1>
            <p className="text-gray-600 max-w-md mb-8">
                This module will allow specific management of fabrics, styles, and measurements unique to Saudi traditional wear (Thobes, Ghutras).
            </p>
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
                Return to Dashboard
            </Link>
        </div>
    );
}
