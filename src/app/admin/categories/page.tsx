'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FaTags, FaPlus, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase.from('categories').select('*').order('name');
            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async () => {
        const name = window.prompt("Enter new category name:");
        if (!name) return;

        const description = window.prompt("Enter description:");

        try {
            const { error } = await supabase
                .from('categories')
                .insert([{ name, description, is_active: true }]);

            if (error) throw error;
            toast.success('Category added');
            fetchCategories();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add category');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('categories')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-600">Manage clothing categories and pricing</p>
                </div>
                <div className="flex space-x-4">
                    <Link href="/admin/dashboard" className="text-blue-600 hover:underline flex items-center">
                        Back to Dashboard
                    </Link>
                    <button
                        onClick={addCategory}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <FaPlus /> <span>Add Category</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p className="text-center col-span-3">Loading...</p> : categories.map(cat => (
                    <div key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                <FaTags />
                            </div>
                            <button
                                onClick={() => toggleStatus(cat.id, cat.is_active)}
                                className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors
                    ${cat.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                            >
                                {cat.is_active ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                        <h3 className="font-bold text-xl mb-1 text-gray-800">{cat.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 min-h-[40px]">{cat.description || 'No description provided.'}</p>

                        <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>ID: {cat.id.slice(0, 8)}...</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
