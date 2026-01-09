'use client';

import { useState, ChangeEvent, FormEvent, ReactNode, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaTshirt, FaRulerVertical, FaPalette, FaCheck, FaArrowLeft, FaArrowRight, FaFileUpload, FaSpinner } from 'react-icons/fa';
import { orderAPI, userAPI, staffAPI } from '../../../../../lib/api';
import { supabase } from '../../../../../lib/supabase';
import { toast } from 'react-hot-toast';

const InputField = ({ name, label, type = 'text', value, onChange, placeholder, required = false, children = null }: { name: string; label: string; type?: string; value: string | number; onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void; placeholder?: string; required?: boolean; children?: ReactNode; }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="relative">
            {type === 'select' ? (
                <select id={name} name={name} value={value} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none" required={required}>
                    {children}
                </select>
            ) : type === 'textarea' ? (
                <textarea id={name} name={name} value={value as string} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder={placeholder} rows={4} />
            ) : (
                <input id={name} name={name} type={type} value={value} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder={placeholder} required={required} />
            )}
        </div>
    </div>
);

export default function EditOrderPage() {
    const params = useParams();
    const orderId = params.id as string;
    const router = useRouter();

    const [orderData, setOrderData] = useState({
        category: '',
        clothingType: '',
        gender: 'male',
        quantity: 1,
        fabricType: '',
        color: '',
        stitchingStyle: '',
        designReference: null as File | null,
        measurements: {
            chest: '', waist: '', hip: '', shoulder: '', sleeveLength: '', shirtLength: '', trouserLength: '', neck: '',
        },
        customNotes: '',
        expectedCompletionDate: '',
        tailor_id: '',
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [tailors, setTailors] = useState<any[]>([]);
    const totalSteps = 4;

    useEffect(() => {
        fetchInitialData();
    }, [orderId]);

    const fetchInitialData = async () => {
        setIsFetching(true);
        try {
            // 1. Get User
            const profile = await userAPI.getCurrentUser();
            if (!profile) {
                toast.error('Please login to edit order');
                router.push('/auth/login');
                return;
            }
            setUserProfile(profile);

            // 2. Get Tailors
            const tailorsData = await staffAPI.getTailors();
            setTailors(tailorsData as any[]);

            // 3. Get Order Details
            let query = supabase.from('orders').select('*');
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
            if (isUuid) {
                query = query.eq('id', orderId);
            } else {
                query = query.eq('order_id', orderId);
            }
            const { data: order, error: orderError } = await query.single();

            if (orderError) throw orderError;
            if (order.status !== 'pending') {
                toast.error('Only pending orders can be edited.');
                router.push('/customer/orders');
                return;
            }

            // 4. Get Measurements
            const { data: meas } = await supabase
                .from('order_measurements')
                .select('*')
                .eq('order_id', order.id)
                .single();

            // Pre-fill measurements (map snake_case to camelCase)
            const mappedMeas: any = { ...orderData.measurements };
            if (meas) {
                Object.entries(meas).forEach(([key, value]) => {
                    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                    if (camelKey in mappedMeas) {
                        mappedMeas[camelKey] = value || '';
                    }
                });
            }

            setOrderData({
                category: order.category,
                clothingType: order.clothing_type,
                gender: order.gender,
                quantity: order.quantity,
                fabricType: order.fabric_type || '',
                color: order.color || '',
                stitchingStyle: order.stitching_style || '',
                designReference: null, // Keep null as we don't fetch the file back to the input
                measurements: mappedMeas,
                customNotes: order.custom_notes || '',
                expectedCompletionDate: order.expected_completion_date,
                tailor_id: order.tailor_id || '',
            });

        } catch (err: any) {
            console.error('Fetch error:', err);
            toast.error('Could not load order details');
            router.push('/customer/orders');
        } finally {
            setIsFetching(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('measurements.')) {
            const field = name.split('.')[1];
            setOrderData(prev => ({ ...prev, measurements: { ...prev.measurements, [field]: value } }));
        } else {
            setOrderData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setOrderData(prev => ({ ...prev, designReference: e.target.files![0] }));
        }
    };

    const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!userProfile) return;

        setIsLoading(true);
        try {
            const submissionData = {
                category: orderData.category,
                clothing_type: orderData.clothingType,
                gender: orderData.gender,
                quantity: orderData.quantity,
                fabric_type: orderData.fabricType || undefined,
                color: orderData.color || undefined,
                stitching_style: orderData.stitchingStyle || undefined,
                custom_notes: orderData.customNotes || undefined,
                expected_completion_date: orderData.expectedCompletionDate,
                designFile: orderData.designReference || undefined,
                measurements: orderData.measurements,
                tailor_id: orderData.tailor_id || undefined
            };

            // Need the UUID for update
            const { data: orderObj } = await supabase.from('orders').select('id').eq('order_id', orderId).or(`id.eq.${orderId}`).single();

            if (!orderObj) {
                throw new Error('Could not find order to update');
            }

            await orderAPI.updateOrder(orderObj.id, submissionData as any);
            toast.success('Order updated successfully!');
            router.push('/customer/orders');
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.message || 'Failed to update order');
        } finally {
            setIsLoading(false);
        }
    };

    const steps = ['Basic Info', 'Measurements', 'Design', 'Review'];

    if (isFetching) return <div className="p-12 text-center text-gray-500"><FaSpinner className="animate-spin inline-block mr-2" /> Loading order data...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900">Edit Order</h1>
                    <p className="text-gray-600 mt-2">Update your order details below.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField name="category" label="Category" type="select" value={orderData.category} onChange={handleInputChange} required>
                                        <option value="">Select Category</option>
                                        <option value="shalwar-kameez">Shalwar Kameez</option>
                                        <option value="saudi-wear">Saudi Traditional Wear</option>
                                    </InputField>
                                    <InputField name="clothingType" label="Clothing Type" type="select" value={orderData.clothingType} onChange={handleInputChange} required>
                                        <option value="">Select Type</option>
                                        <option value="simple-shalwar-kameez">Simple Shalwar Kameez</option>
                                        <option value="designer-shalwar-kameez">Designer Shalwar Kameez</option>
                                        <option value="thobe">Thobe (Dishdasha)</option>
                                        {/* Add others as needed or based on category selection */}
                                    </InputField>
                                    <InputField name="gender" label="Gender" type="select" value={orderData.gender} onChange={handleInputChange}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </InputField>
                                    <InputField name="quantity" label="Quantity" type="number" value={orderData.quantity} onChange={handleInputChange} required />
                                    <InputField name="fabricType" label="Fabric Type" value={orderData.fabricType} onChange={handleInputChange} required />
                                    <InputField name="color" label="Color" value={orderData.color} onChange={handleInputChange} required />
                                    <InputField name="stitchingStyle" label="Stitching Style" value={orderData.stitchingStyle} onChange={handleInputChange} required />
                                    <InputField name="tailor_id" label="Select Tailor" type="select" value={orderData.tailor_id} onChange={handleInputChange} required>
                                        <option value="">Select a Tailor</option>
                                        {tailors.map(t => (
                                            <option key={t.id} value={t.id}>{t.full_name}</option>
                                        ))}
                                    </InputField>
                                    <InputField name="expectedCompletionDate" label="Expected Completion Date" type="date" value={orderData.expectedCompletionDate} onChange={handleInputChange} required />
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Measurements</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(Object.keys(orderData.measurements) as Array<keyof typeof orderData.measurements>).map(key => (
                                        <InputField key={key} name={`measurements.${key}`} label={`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}`} value={orderData.measurements[key]} onChange={handleInputChange} placeholder="Inches" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Design Reference & Notes</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Design Reference (Optional)</label>
                                    <input type="file" onChange={handleFileChange} className="w-full" accept="image/*" />
                                    <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing reference.</p>
                                </div>
                                <InputField name="customNotes" label="Custom Notes" type="textarea" value={orderData.customNotes} onChange={handleInputChange} />
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Review Changes</h2>
                                <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                                    <p><strong>Category:</strong> {orderData.category}</p>
                                    <p><strong>Type:</strong> {orderData.clothingType}</p>
                                    <p><strong>Tailor:</strong> {tailors.find(t => t.id === orderData.tailor_id)?.full_name || 'None'}</p>
                                    <p><strong>Notes:</strong> {orderData.customNotes || 'No notes'}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-10">
                            <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-6 py-2 bg-gray-100 rounded-lg">Previous</button>
                            {currentStep < totalSteps ? (
                                <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Next</button>
                            ) : (
                                <button type="submit" disabled={isLoading} className="px-6 py-2 bg-emerald-600 text-white rounded-lg">
                                    {isLoading ? 'Updating...' : 'Save Changes'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
