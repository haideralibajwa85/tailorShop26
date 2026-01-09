'use client';

import { useState, ChangeEvent, FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import { FaTshirt, FaRulerVertical, FaPalette, FaCheck, FaArrowLeft, FaArrowRight, FaFileUpload, FaSpinner } from 'react-icons/fa';
import { orderAPI, userAPI, staffAPI } from '../../../../lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

export default function NewOrderPage() {
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tailors, setTailors] = useState<any[]>([]);
  const router = useRouter();
  const totalSteps = 4;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await userAPI.getCurrentUser();
        if (profile) {
          setUserProfile(profile);
        } else {
          toast.error('Please login to create an order');
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    const fetchTailors = async () => {
      try {
        const data = await staffAPI.getTailors() as any[];
        setTailors(data || []);
      } catch (err) {
        console.error('Error fetching tailors:', err);
      }
    };

    fetchUser();
    fetchTailors();
  }, [router]);

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
    if (!userProfile) {
      toast.error('User not identified. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const submissionData = {
        customer_id: userProfile.id,
        organization_id: userProfile.organization_id || undefined,
        category: orderData.category,
        clothing_type: orderData.clothingType,
        gender: orderData.gender,
        quantity: orderData.quantity,
        fabric_type: orderData.fabricType || undefined,
        color: orderData.color || undefined,
        stitching_style: orderData.stitchingStyle || undefined,
        custom_notes: orderData.customNotes || undefined,
        order_date: new Date().toISOString().split('T')[0],
        expected_completion_date: orderData.expectedCompletionDate,
        designFile: orderData.designReference,
        measurements: orderData.measurements,
        tailor_id: orderData.tailor_id || undefined
      };

      await orderAPI.createOrder(submissionData as any);
      toast.success('Order created successfully!');
      router.push('/customer/dashboard');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['Basic Info', 'Measurements', 'Design', 'Review'];
  const icons = [<FaTshirt key="1" />, <FaRulerVertical key="2" />, <FaPalette key="3" />, <FaCheck key="4" />];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600 mt-2">Follow the steps to place your custom tailoring order.</p>
        </header>

        {/* Progress Bar */}
        <div className="w-full max-w-3xl mx-auto mb-12">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center ${index < steps.length - 1 ? 'w-full' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${currentStep > index + 1 ? 'bg-blue-600 text-white' : (currentStep === index + 1 ? 'border-2 border-blue-600 text-blue-600 bg-white' : 'bg-white border-2 border-gray-300 text-gray-400')}`}>
                  {icons[index]}
                </div>
                <div className={`text-sm font-medium ml-3 ${currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-500'}`}>{step}</div>
                {index < steps.length - 1 && <div className={`flex-auto border-t-2 transition-all duration-500 mx-4 ${currentStep > index + 1 ? 'border-blue-600' : 'border-gray-300'}`}></div>}
              </div>
            ))}
          </div>
        </div>

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
                    {orderData.category === 'shalwar-kameez' && (
                      <>
                        <option value="simple-shalwar-kameez">Simple Shalwar Kameez</option>
                        <option value="designer-shalwar-kameez">Designer Shalwar Kameez</option>
                        <option value="wedding-shalwar-kameez">Wedding Shalwar Kameez</option>
                        <option value="casual-office-wear">Casual / Office Wear</option>
                      </>
                    )}
                    {orderData.category === 'saudi-wear' && (
                      <>
                        <option value="thobe">Thobe (Dishdasha)</option>
                        <option value="ghutra-igal">Ghutra & Igal</option>
                        <option value="bisht">Bisht</option>
                        <option value="abaya">Abaya</option>
                        <option value="hijab">Hijab</option>
                        <option value="kaftans-jallabiyas">Kaftans & Jallabiyas</option>
                      </>
                    )}
                  </InputField>
                  <InputField name="gender" label="Gender" type="select" value={orderData.gender} onChange={handleInputChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </InputField>
                  <InputField name="quantity" label="Quantity" type="number" value={orderData.quantity} onChange={handleInputChange} required />
                  <InputField name="fabricType" label="Fabric Type" value={orderData.fabricType} onChange={handleInputChange} placeholder="e.g., Cotton, Linen, Silk" required />
                  <InputField name="color" label="Color" value={orderData.color} onChange={handleInputChange} placeholder="e.g., White, Black, Blue" required />
                  <InputField name="stitchingStyle" label="Stitching Style" value={orderData.stitchingStyle} onChange={handleInputChange} placeholder="e.g., Regular, Slim Fit" required />
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
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Design Reference</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Design Reference</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaFileUpload className="w-10 h-10 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 10MB)</p>
                      </div>
                      <input type="file" name="designReference" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                  </div>
                  {orderData.designReference && <p className="mt-2 text-sm text-gray-600">Selected file: {orderData.designReference.name}</p>}
                </div>
                <InputField name="customNotes" label="Custom Notes" type="textarea" value={orderData.customNotes} onChange={handleInputChange} placeholder="Any special instructions..." />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Review Your Order</h2>
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  {Object.entries(orderData).map(([key, value]) => {
                    if (key === 'designReference' || key === 'measurements' || key === 'customNotes') return null;
                    return (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                        <span>{key === 'tailor_id' ? (tailors.find(t => t.id === value)?.full_name || 'None') : String(value)}</span>
                      </div>
                    );
                  })}
                  <h3 className="text-lg font-bold text-gray-800 pt-4">Measurements</h3>
                  {Object.entries(orderData.measurements).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                      <span>{value ? `${value} inches` : 'Not provided'}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-b"><span className="font-medium text-gray-700">Design Reference:</span> <span>{orderData.designReference ? orderData.designReference.name : 'None'}</span></div>
                  <div className="flex justify-between py-2"><span className="font-medium text-gray-700">Custom Notes:</span> <span>{orderData.customNotes || 'None'}</span></div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-10">
              <button type="button" onClick={prevStep} disabled={currentStep === 1} className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${currentStep === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}>
                <FaArrowLeft className="mr-2" /> Previous
              </button>
              {currentStep < totalSteps ? (
                <button type="button" onClick={nextStep} className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                  Next <FaArrowRight className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Processing...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" /> Submit Order
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}