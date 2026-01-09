'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaRulerVertical } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                    address: profile.address,
                })
                .eq('id', profile.id);

            if (error) throw error;
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error: any) {
            toast.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center">Please log in to view profile.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <FaUser size={30} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{profile.full_name}</h2>
                            <p className="text-gray-500 uppercase text-sm">{profile.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={updateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                value={profile.full_name}
                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="text"
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea
                                value={profile.address}
                                onChange={e => setProfile({ ...profile, address: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <FaEnvelope className="text-gray-400 mr-3" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <FaPhone className="text-gray-400 mr-3" />
                            <span>{profile.phone || 'No phone added'}</span>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <FaMapMarkerAlt className="text-gray-400 mr-3" />
                            <span>{profile.address || 'No address added'}</span>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <FaRulerVertical className="text-gray-400 mr-3" />
                            <span>Preferred Language: {profile.language_preference === 'en' ? 'English' : profile.language_preference}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
