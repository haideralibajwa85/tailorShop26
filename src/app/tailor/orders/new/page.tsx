'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { FaRulerCombined, FaUser, FaHistory, FaRedo, FaSearch, FaUserTie, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Suspense } from 'react';

function OrderForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const customerIdFromQuery = searchParams.get('customerId');

    const [tailorProfile, setTailorProfile] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [clothingTypes, setClothingTypes] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [stitchers, setStitchers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [previousOrders, setPreviousOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        clothing_type: '',
        gender: 'male',
        quantity: 1,
        fabric_type: '',
        color: '',
        stitching_style: '',
        total_amount: 0,
        advance_amount: 0,
        expected_completion_date: '',
        assigned_stitcher_id: '',
    });

    const [measurements, setMeasurements] = useState({
        chest: '',
        waist: '',
        hip: '',
        shoulder: '',
        sleeve_length: '',
        shirt_length: '',
        trouser_length: '',
        neck: '',
        bicep: '',
        cuff: '',
        seat: '',
        knee: '',
        ankle: '',
        measurement_notes: '',
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch history when customer is selected
    useEffect(() => {
        if (selectedCustomer) {
            fetchCustomerHistory(selectedCustomer.id);
        } else {
            setPreviousOrders([]);
        }
    }, [selectedCustomer]);

    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        setTailorProfile(profile);

        // Fetch Categories and Clothing Types
        const { data: cats } = await supabase.from('categories').select('*').order('name');
        setCategories(cats || []);

        const { data: types } = await supabase.from('clothing_types').select('*').order('name');
        setClothingTypes(types || []);

        if (profile?.organization_id) {
            // Fetch Customers
            const { data: customersData } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'customer')
                .eq('organization_id', profile.organization_id);
            setCustomers(customersData || []);

            if (customerIdFromQuery) {
                const found = customersData?.find((c: any) => c.id === customerIdFromQuery);
                if (found) setSelectedCustomer(found);
            }

            // Fetch Stitchers
            const { data: stitchersData } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'stitcher')
                .eq('organization_id', profile.organization_id);
            setStitchers(stitchersData || []);
        }
    };

    const fetchCustomerHistory = async (customerId: string) => {
        try {
            // Fetch orders for this customer to find distinct templates
            const { data: history, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter unique by category (taking the latest one)
            const uniqueHistory: any[] = [];
            const seenCategories = new Set();

            if (history) {
                for (const order of history) {
                    if (!seenCategories.has(order.category)) {
                        uniqueHistory.push(order);
                        seenCategories.add(order.category);
                    }
                }
            }
            setPreviousOrders(uniqueHistory);

        } catch (error) {
            console.error('Error fetching customer history:', error);
        }
    };

    const handleTemplateSelect = async (order: any) => {
        if (confirm(`Load details from previous ${order.category} order? This will overwrite current form values.`)) {
            // 1. Prefill Basic Info
            setFormData(prev => ({
                ...prev,
                category: order.category,
                clothing_type: order.clothing_type,
                gender: order.gender,
                fabric_type: order.fabric_type,
                color: order.color,
                stitching_style: order.stitching_style,
                quantity: order.quantity,
                // Do not copy dates or payments or assignment
            }));

            // 2. Fetch and Prefill Measurements
            try {
                console.log('Fetching measurements for order:', order.id);
                const { data: measure, error } = await supabase
                    .from('order_measurements')
                    .select('*')
                    .eq('order_id', order.id)
                    .single();

                console.log('Measurement fetch result:', { measure, error });

                if (measure) {
                    const newMeasurements = {
                        chest: measure.chest || '',
                        waist: measure.waist || '',
                        hip: measure.hip || '',
                        shoulder: measure.shoulder || '',
                        sleeve_length: measure.sleeve_length || '',
                        shirt_length: measure.shirt_length || '',
                        trouser_length: measure.trouser_length || '',
                        neck: measure.neck || '',
                        bicep: measure.bicep || '',
                        cuff: measure.cuff || '',
                        seat: measure.seat || '',
                        knee: measure.knee || '',
                        ankle: measure.ankle || '',
                        measurement_notes: measure.measurement_notes || '',
                    };
                    console.log('Setting measurements to:', newMeasurements);
                    setMeasurements(newMeasurements);
                    toast.success(`Loaded details for ${order.category}`);
                }
            } catch (err) {
                console.error('Error fetching measurements for template:', err);
                toast.error('Could not load measurements for this order');
            }
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'category') {
            // Reset clothing type when category changes
            setFormData(prev => ({ ...prev, category: value, clothing_type: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMeasurements(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) {
            toast.error('Please select a customer first');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order
            const orderIdValue = `TS-${Math.floor(1000 + Math.random() * 9000)}`;
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    customer_id: selectedCustomer.id,
                    tailor_id: tailorProfile.id,
                    organization_id: tailorProfile.organization_id, // Added organization_id
                    order_id: orderIdValue,
                    category: formData.category,
                    clothing_type: formData.clothing_type,
                    gender: formData.gender,
                    quantity: formData.quantity,
                    fabric_type: formData.fabric_type,
                    color: formData.color,
                    stitching_style: formData.stitching_style,
                    total_amount: formData.total_amount,
                    advance_amount: formData.advance_amount,
                    expected_completion_date: formData.expected_completion_date,
                    status: 'pending'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Save Measurements
            const { error: measurementError } = await supabase
                .from('order_measurements')
                .insert([{
                    order_id: order.id,
                    ...measurements
                }]);

            if (measurementError) {
                console.error('Error saving measurements:', measurementError);
                toast.error('Order created but measurements failed to save.');
            }

            // 3. Assign Stitcher if selected
            if (formData.assigned_stitcher_id) {
                const { error: assignError } = await supabase
                    .from('work_assignments')
                    .insert([{
                        order_id: order.id,
                        stitcher_id: formData.assigned_stitcher_id,
                        tailor_id: tailorProfile.id,
                        status: 'pending'
                    }]);

                if (assignError) {
                    console.error('Error assigning stitcher:', assignError);
                    toast.error('Order created but stitcher assignment failed.');
                }
            }

            toast.success('Order created successfully!');
            router.push('/tailor/dashboard');
        } catch (error: any) {
            console.error('Error creating order:', error);
            toast.error(error.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/tailor/dashboard" className="p-3 bg-white rounded-xl shadow-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <FaArrowLeft />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">New Order Creation</h1>
                            <p className="text-gray-600 font-medium">Record measurements and assign tasks.</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side: Customer Selection & Assignment */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUser className="text-blue-600" /> Customer Selection
                            </h2>

                            {!selectedCustomer ? (
                                <>
                                    <div className="relative mb-4">
                                        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search customer..."
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                        {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => setSelectedCustomer(c)}
                                                className="w-full text-left p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
                                            >
                                                <p className="font-bold text-gray-900 group-hover:text-blue-700">{c.full_name}</p>
                                                <p className="text-xs text-gray-500">{c.phone || c.email}</p>
                                            </button>
                                        )) : (
                                            <div className="text-center py-4">
                                                <p className="text-sm text-gray-400">No customers found.</p>
                                                <Link href="/tailor/customers/new" className="text-xs font-bold text-blue-600 hover:underline">+ Register New</Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Selected</p>
                                        <p className="font-bold text-gray-900">{selectedCustomer.full_name}</p>
                                        <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCustomer(null)}
                                        className="text-xs font-bold text-red-600 hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Repeat Order / History Section */}
                        {selectedCustomer && previousOrders.length > 0 && (
                            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaHistory className="text-amber-500" /> Repeat Order
                                </h2>
                                <p className="text-xs text-gray-500 mb-3">Click to load details from previous orders:</p>
                                <div className="space-y-2">
                                    {previousOrders.map(order => (
                                        <button
                                            key={order.id}
                                            onClick={() => handleTemplateSelect(order)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-all group text-left"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-amber-800">{order.category}</p>
                                                <p className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <FaRedo className="text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUserTie className="text-indigo-600" /> Assignment
                            </h2>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Stitcher *</label>
                            <select
                                name="assigned_stitcher_id"
                                value={formData.assigned_stitcher_id}
                                onChange={handleFormChange}
                                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select a stitcher (Optional)...</option>
                                {stitchers.map(s => (
                                    <option key={s.id} value={s.id}>{s.full_name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Assign now or later from dashboard</p>
                        </section>
                    </div>

                    {/* Right Side: Order Details */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleFormChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Clothing Type */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Clothing Type</label>
                                        <select
                                            name="clothing_type"
                                            value={formData.clothing_type}
                                            onChange={handleFormChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            required
                                            disabled={!formData.category}
                                        >
                                            <option value="">Select Type</option>
                                            {clothingTypes
                                                .filter(type => {
                                                    const selectedCat = categories.find(c => c.name === formData.category);
                                                    return selectedCat && type.category_id === selectedCat.id;
                                                })
                                                .map(type => (
                                                    <option key={type.id} value={type.name}>{type.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    {/* Fabric & Color */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Fabric Type</label>
                                        <input type="text" name="fabric_type" value={formData.fabric_type} onChange={handleFormChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cotton, Silk, etc." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                                        <input type="text" name="color" value={formData.color} onChange={handleFormChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Navy Blue, White, etc." />
                                    </div>

                                    {/* Stitching Style & Gender */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Stitching Style</label>
                                        <input type="text" name="stitching_style" value={formData.stitching_style} onChange={handleFormChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Regular, Slim Fit, etc." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    {/* Quantity & Delivery Date */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                                        <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleFormChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Expected Completion *</label>
                                        <input type="date" name="expected_completion_date" value={formData.expected_completion_date} onChange={handleFormChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Measurements (Inches)</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {Object.entries(measurements).map(([key, value]) => {
                                        if (key === 'measurement_notes') return null; // Handle notes separately
                                        return (
                                            <div key={key}>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{key.replace('_', ' ')}</label>
                                                <input
                                                    type="text"
                                                    name={key}
                                                    value={value}
                                                    onChange={handleMeasurementChange}
                                                    placeholder="0.0"
                                                    className="w-full p-2.5 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono text-center"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Measurement Notes */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Measurement Notes</label>
                                    <textarea
                                        name="measurement_notes"
                                        value={measurements.measurement_notes}
                                        onChange={handleMeasurementChange}
                                        placeholder="Any specific instructions..."
                                        className="w-full p-3 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Financials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Total Amount (Price)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-gray-400 font-bold">$</span>
                                            <input type="number" name="total_amount" value={formData.total_amount} onChange={handleFormChange} className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Advance Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-gray-400 font-bold">$</span>
                                            <input type="number" name="advance_amount" value={formData.advance_amount} onChange={handleFormChange} className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <FaSave /> {loading ? 'Saving Order...' : 'Create & Assign Order'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TailorNewOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
            <OrderForm />
        </Suspense>
    );
}
