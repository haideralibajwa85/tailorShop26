'use client';

import { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { stitcherAuth } from '../lib/stitcherAuth';
import { stitcherService } from '../lib/stitcherService';
import { toast } from 'react-hot-toast';

interface StitcherModalProps {
    onClose: () => void;
    onSuccess: () => void;
    stitcher?: any;
    tailorId: string;
    organizationId: string;
}

export default function StitcherModal({ onClose, onSuccess, stitcher, tailorId, organizationId }: StitcherModalProps) {
    const isEdit = !!stitcher;
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: stitcher?.full_name || '',
        phone: stitcher?.phone || '',
        username: stitcher?.email?.split('@')[0] || '',
        password: '',
        address: stitcher?.address || '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEdit) {
                const result = await stitcherAuth.updateStitcher(stitcher.id, {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address
                });
                if (result.success) {
                    toast.success('Worker details updated!');
                    onSuccess();
                } else throw new Error(result.error);
            } else {
                const result = await stitcherService.createStitcher({
                    username: formData.username,
                    password: formData.password,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    tailor_id: tailorId,
                    organization_id: organizationId
                });
                if (result.success) {
                    toast.success('New worker registered!');
                    onSuccess();
                } else throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 flex justify-between items-center text-white">
                    <h2 className="text-xl font-black uppercase tracking-wider">{isEdit ? 'Edit Worker Detail' : 'Register New Staff'}</h2>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Legal Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold"
                                required
                            />
                        </div>

                        {!isEdit && (
                            <>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">UserID for Login</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold"
                                        required
                                        placeholder="e.g. worker_01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Initial Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold pr-12"
                                            required
                                            minLength={6}
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
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">WhatsApp / Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold"
                                placeholder="+966 5..."
                            />
                        </div>

                        <div className={isEdit ? '' : 'md:col-span-2'}>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Residential Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl text-slate-400 font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1"
                        >
                            {isLoading ? 'Wait...' : isEdit ? 'Save Changes' : 'Register Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
