'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { FaArrowLeft, FaRulerCombined, FaInfoCircle, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FaTshirt, FaUserTie } from 'react-icons/fa';
import { GiArmoredPants } from 'react-icons/gi';

export default function TailorOrderDetailPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [measurements, setMeasurements] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [editMeasurements, setEditMeasurements] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            let query = supabase.from('orders').select('*, users!customer_id(full_name)');

            // Check if UUID or custom OrderID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

            if (isUuid) {
                query = query.eq('id', orderId);
            } else {
                query = query.eq('order_id', orderId);
            }

            const { data: orderData, error: orderError } = await query.single();

            if (orderError) {
                if (orderError.code === 'PGRST116') {
                    setOrder(null);
                    return;
                }
                throw orderError;
            }

            setOrder(orderData);

            if (orderData) {
                const { data: measData, error: measError } = await supabase
                    .from('order_measurements')
                    .select('*')
                    .eq('order_id', orderData.id)
                    .single();

                if (!measError) {
                    setMeasurements(measData);
                }
            }

        } catch (error: any) {
            console.error('Error fetching order details:', error);
            toast.error('Could not load order details.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            // Initialize edit state
            setEditForm({ ...order });
            setEditMeasurements({ ...measurements });
        }
        setIsEditing(!isEditing);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditMeasurements((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        console.log('Order Edit Debug - Start', { orderId: order.id });
        setSaving(true);
        try {
            // 1. Update Order
            console.log('Order Edit Debug - Updating core details');
            const { error: orderError } = await supabase
                .from('orders')
                .update({
                    category: editForm.category,
                    clothing_type: editForm.clothing_type,
                    fabric_type: editForm.fabric_type,
                    color: editForm.color,
                    quantity: editForm.quantity,
                    expected_completion_date: editForm.expected_completion_date,
                    custom_notes: editForm.custom_notes,
                })
                .eq('id', order.id);

            if (orderError) {
                console.error('Order Edit Debug - Order update error:', orderError);
                throw orderError;
            }

            // 2. Update Measurements
            if (measurements) {
                console.log('Order Edit Debug - Updating measurements');
                const { id, order_id, created_at, updated_at, ...measureUpdates } = editMeasurements;

                const { error: measError } = await supabase
                    .from('order_measurements')
                    .update(measureUpdates)
                    .eq('order_id', order.id);

                if (measError) {
                    console.error('Order Edit Debug - Measurement update error:', measError);
                    throw measError;
                }
            }

            console.log('Order Edit Debug - Success');
            toast.success('Order updated successfully!');
            setIsEditing(false);
            fetchOrderDetails(); // Refresh data

        } catch (error: any) {
            console.error('Order Edit Debug - CRITICAL ERROR:', error);
            toast.error('Failed to update order: ' + (error.message || 'Unknown error'));
        } finally {
            console.log('Order Edit Debug - End (finally)');
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <Link href="/tailor/orders" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                    <FaArrowLeft className="mr-2" /> Back to Assigned Orders
                </Link>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleEditToggle}
                                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                disabled={saving}
                            >
                                <FaTimes className="mr-2" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                                disabled={saving}
                            >
                                <FaSave className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleEditToggle}
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
                        >
                            <FaEdit className="mr-2 text-blue-500" /> Edit Order
                        </button>
                    )}
                </div>
            </div>

            <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${isEditing ? 'ring-2 ring-blue-400' : ''}`}>
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Order #{order.order_id}</h1>
                        <p className="opacity-90">Customer: {order.users?.full_name}</p>
                    </div>
                    <div className="px-4 py-1 bg-white/20 rounded-full font-semibold backdrop-blur-sm uppercase text-sm">
                        {order.status.replace('_', ' ')}
                    </div>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                    {/* Left Column: Order Details */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaInfoCircle className="mr-2 text-blue-500" /> Order Details
                        </h3>
                        <div className="space-y-4 text-gray-600">
                            {/* Category */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-1">
                                <span className="text-sm font-semibold">Category</span>
                                {isEditing ? (
                                    <input
                                        type="text" name="category" value={editForm.category || ''} onChange={handleFormChange}
                                        className="border rounded px-2 py-1 text-gray-900 w-full sm:w-1/2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <span className="font-medium text-gray-900">{order.category}</span>
                                )}
                            </div>

                            {/* Clothing Type */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-1">
                                <span className="text-sm font-semibold">Clothing Type</span>
                                {isEditing ? (
                                    <input
                                        type="text" name="clothing_type" value={editForm.clothing_type || ''} onChange={handleFormChange}
                                        className="border rounded px-2 py-1 text-gray-900 w-full sm:w-1/2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <span className="font-medium text-gray-900">{order.clothing_type}</span>
                                )}
                            </div>

                            {/* Fabric */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-1">
                                <span className="text-sm font-semibold">Fabric Type</span>
                                {isEditing ? (
                                    <input
                                        type="text" name="fabric_type" value={editForm.fabric_type || ''} onChange={handleFormChange}
                                        className="border rounded px-2 py-1 text-gray-900 w-full sm:w-1/2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <span className="font-medium text-gray-900">{order.fabric_type}</span>
                                )}
                            </div>

                            {/* Color */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-1">
                                <span className="text-sm font-semibold">Color</span>
                                {isEditing ? (
                                    <input
                                        type="text" name="color" value={editForm.color || ''} onChange={handleFormChange}
                                        className="border rounded px-2 py-1 text-gray-900 w-full sm:w-1/2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <span className="font-medium text-gray-900">{order.color}</span>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-1">
                                <span className="text-sm font-semibold">Quantity</span>
                                {isEditing ? (
                                    <input
                                        type="number" name="quantity" value={editForm.quantity || 1} onChange={handleFormChange}
                                        className="border rounded px-2 py-1 text-gray-900 w-full sm:w-1/2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <span className="font-medium text-gray-900">{order.quantity}</span>
                                )}
                            </div>

                            {/* Due Date */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 gap-1">
                                <span className="text-sm font-semibold">Due Date</span>
                                {isEditing ? (
                                    <input
                                        type="date" name="expected_completion_date" value={editForm.expected_completion_date || ''} onChange={handleFormChange}
                                        className="border rounded px-2 py-1 text-gray-900 w-full sm:w-1/2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <span className="font-medium text-blue-600">{new Date(order.expected_completion_date).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>

                        {/* Custom Notes */}
                        <div className="mt-6">
                            <span className="block font-medium text-gray-700 mb-1">Custom Notes</span>
                            {isEditing ? (
                                <textarea
                                    name="custom_notes"
                                    value={editForm.custom_notes || ''}
                                    onChange={handleFormChange}
                                    className="w-full border rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-yellow-50"
                                    rows={3}
                                />
                            ) : (
                                order.custom_notes && (
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                        <p className="text-yellow-700 text-sm">{order.custom_notes}</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Right Column: Measurements */}
                    <div className="space-y-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaRulerCombined className="mr-2 text-blue-500" /> {t('order.measurements')} (Inches)
                        </h3>
                        {measurements || isEditing ? (
                            <>
                                {/* Kameez Section */}
                                <div className="space-y-6">
                                    <h4 className="text-md font-bold text-blue-600 bg-blue-50 p-3 rounded-xl flex items-center gap-2">
                                        <FaTshirt /> {t('order.kameez')}
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {[
                                            { key: 'shirt_length', label: t('order.shirtLength') },
                                            { key: 'shoulder', label: t('order.shoulder') },
                                            { key: 'chest', label: t('order.chest') },
                                            { key: 'waist', label: t('order.waist') },
                                            { key: 'hip', label: t('order.hip') },
                                            { key: 'armhole', label: t('order.armhole') },
                                            { key: 'sleeve_length', label: t('order.sleeveLength') },
                                            { key: 'bicep', label: t('order.bicep') },
                                            { key: 'neck', label: t('order.neck') },
                                            { key: 'cuff', label: t('order.cuff') },
                                            { key: 'collar_size', label: t('order.collarSize') },
                                            { key: 'front_patti_length', label: t('order.frontPattiLength') },
                                            { key: 'side_chak_length', label: t('order.sideChakLength') },
                                            { key: 'daman_width', label: t('order.damanWidth') }
                                        ].map((field) => {
                                            const val = isEditing ? editMeasurements[field.key] : measurements?.[field.key];
                                            return (
                                                <div key={field.key} className={`p-3 rounded-lg text-center ${isEditing ? 'bg-white border-2 border-blue-50 shadow-sm' : 'bg-gray-50'}`}>
                                                    <span className="block text-[10px] uppercase text-gray-400 mb-1 font-bold">{field.label}</span>
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <input
                                                                type="text"
                                                                name={field.key}
                                                                value={val || ''}
                                                                onChange={handleMeasurementChange}
                                                                className="w-16 text-center font-bold text-blue-600 border-b-2 border-blue-100 focus:border-blue-500 outline-none bg-transparent"
                                                            />
                                                            <span className="text-gray-300 font-bold">"</span>
                                                        </div>
                                                    ) : (
                                                        <span className="block font-bold text-gray-800">{val ? `${val}"` : '-'}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Kameez Styles */}
                                    <div className="grid grid-cols-1 gap-6 pt-6 border-t border-dashed border-gray-200">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {/* Fit Type */}
                                            <div>
                                                <label className="block text-xs uppercase text-gray-500 mb-3 font-bold">{t('order.fitType')}</label>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        {['Slim Fit | سلم فٹ', 'Regular Fit | نارمل فٹ', 'Loose Fit | ڈھیلا'].map((opt) => (
                                                            <label key={opt} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200">
                                                                <input
                                                                    type="radio"
                                                                    name="fit_type"
                                                                    value={opt}
                                                                    checked={editMeasurements.fit_type === opt}
                                                                    onChange={handleMeasurementChange}
                                                                    className="w-4 h-4 text-blue-600"
                                                                />
                                                                <span className="text-sm font-medium text-gray-700">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-lg text-sm font-bold text-gray-800 border border-gray-100 italic">
                                                        {measurements?.fit_type || '-'}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Pocket Kameez */}
                                            <div>
                                                <label className="block text-xs uppercase text-gray-500 mb-3 font-bold">{t('order.pocketKameez')}</label>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        {['No Pocket | بغیر جیب', 'Single | ایک جیب', 'Double | دو جیب'].map((opt) => (
                                                            <label key={opt} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200">
                                                                <input
                                                                    type="radio"
                                                                    name="pocket_kameez"
                                                                    value={opt}
                                                                    checked={editMeasurements.pocket_kameez === opt}
                                                                    onChange={handleMeasurementChange}
                                                                    className="w-4 h-4 text-blue-600"
                                                                />
                                                                <span className="text-sm font-medium text-gray-700">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-lg text-sm font-bold text-gray-800 border border-gray-100 italic">
                                                        {measurements?.pocket_kameez || '-'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Style Dropdowns */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            {[
                                                { key: 'collar_style', label: t('order.collarStyle'), options: ['Ban Collar | بن کالر', 'Simple Collar | سادہ کالر', 'Shirt Collar | شرٹ کالر'] },
                                                { key: 'sleeve_style', label: t('order.sleeveStyle'), options: ['Straight | سیدھی', 'Cuff | کف والی'] },
                                                { key: 'daman_style', label: t('order.damanStyle'), options: ['Straight | سیدھا', 'Round | گول', 'Half Round | آدھا گول', 'Square | چوکور', 'Cut Corner | کٹ کارنر', 'Chak | چاک والا'] }
                                            ].map((field) => (
                                                <div key={field.key}>
                                                    <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">{field.label}</label>
                                                    {isEditing ? (
                                                        <select
                                                            name={field.key}
                                                            value={editMeasurements[field.key] || ''}
                                                            onChange={handleMeasurementChange}
                                                            className="w-full p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                                        >
                                                            <option value="">Select style...</option>
                                                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="p-2.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-900 border border-gray-100">
                                                            {measurements?.[field.key] || '-'}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Shalwar Section */}
                                <div className="space-y-6 pt-8 border-t border-gray-100">
                                    <h4 className="text-md font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl flex items-center gap-2">
                                        <GiArmoredPants /> {t('order.shalwar')}
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {[
                                            { key: 'trouser_length', label: t('order.shalwarLength') },
                                            { key: 'waist', label: t('order.waist') },
                                            { key: 'hip', label: t('order.hip') },
                                            { key: 'thigh', label: t('order.thigh') },
                                            { key: 'knee', label: t('order.knee') },
                                            { key: 'ankle', label: t('order.bottomPancha') }
                                        ].map((field) => {
                                            const val = isEditing ? editMeasurements[field.key] : measurements?.[field.key];
                                            return (
                                                <div key={field.key} className={`p-3 rounded-lg text-center ${isEditing ? 'bg-white border-2 border-emerald-50 shadow-sm' : 'bg-gray-50'}`}>
                                                    <span className="block text-[10px] uppercase text-gray-400 mb-1 font-bold">{field.label}</span>
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <input
                                                                type="text"
                                                                name={field.key}
                                                                value={val || ''}
                                                                onChange={handleMeasurementChange}
                                                                className="w-16 text-center font-bold text-emerald-600 border-b-2 border-emerald-100 focus:border-emerald-500 outline-none bg-transparent"
                                                            />
                                                            <span className="text-gray-300 font-bold">"</span>
                                                        </div>
                                                    ) : (
                                                        <span className="block font-bold text-gray-800">{val ? `${val}"` : '-'}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Shalwar Styles (Dropdowns) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-dashed border-gray-200">
                                        {[
                                            { key: 'shalwar_type', label: t('order.shalwarType'), options: ['Simple | سادہ', 'Wide | کھلی شلوار', 'Patiala | پٹیالہ', 'Trouser Style | ٹراؤزر اسٹائل'] },
                                            { key: 'waist_style', label: t('order.waistStyle'), options: ['Naara | ناڑا', 'Elastic | الاسٹک', 'Both | دونوں'] },
                                            { key: 'pocket_type', label: t('order.pocketType'), options: ['No Pocket | بغیر جیب', 'One Side | ایک طرف', 'Both Sides | دونوں طرف', 'Back Pocket | پیچھے جیب', 'Zip Pocket | زِپ والی'] }
                                        ].map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">{field.label}</label>
                                                {isEditing ? (
                                                    <select
                                                        name={field.key}
                                                        value={editMeasurements[field.key] || ''}
                                                        onChange={handleMeasurementChange}
                                                        className="w-full p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                                                    >
                                                        <option value="">Select style...</option>
                                                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <div className="p-2.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-900 border border-gray-100">
                                                        {measurements?.[field.key] || '-'}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-gray-100 pt-6">
                                    <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">Measurement Notes</label>
                                    {isEditing ? (
                                        <textarea
                                            name="measurement_notes"
                                            value={editMeasurements.measurement_notes || ''}
                                            onChange={(e) => setEditMeasurements((prev: any) => ({ ...prev, measurement_notes: e.target.value }))}
                                            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                            rows={3}
                                            placeholder="Enter measurement notes..."
                                        />
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 min-h-[4rem] border border-gray-100 italic">
                                            {measurements?.measurement_notes ? measurements.measurement_notes : <span className="text-gray-400">No notes provided</span>}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="bg-red-50 p-6 rounded-xl text-center">
                                <p className="text-red-500 font-medium">No measurements found for this order.</p>
                                {isEditing && <p className="text-xs text-red-400 mt-2">Edit mode enabled - values will be created.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
