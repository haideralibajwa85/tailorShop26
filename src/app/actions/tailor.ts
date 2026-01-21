'use server';

import { supabaseAdmin } from '../../lib/supabaseAdmin';

export async function createTailorAction(data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    organization_id: string;
    address?: string;
    gender?: string;
    language_preference?: string;
}) {
    try {
        if (!supabaseAdmin) {
            throw new Error('Supabase Admin client not initialized');
        }

        // 1. Create the user using the admin client
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
                full_name: data.full_name,
                role: 'tailor',
                organization_id: data.organization_id,
                phone: data.phone
            }
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return { success: false, error: authError.message };
        }

        if (!authData.user) {
            return { success: false, error: 'User creation failed' };
        }

        // 2. Clear out any existing profile (shouldn't exist but just for safety)
        // Then insert the profile into public.users
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: authData.user.id,
                email: data.email,
                full_name: data.full_name,
                phone: data.phone,
                role: 'tailor',
                organization_id: data.organization_id,
                address: data.address || '',
                gender: data.gender || 'male',
                language_preference: data.language_preference || 'en',
                is_active: true
            });

        if (profileError) {
            console.error('Profile Error:', profileError);
            return { success: false, error: `User created but profile failed: ${profileError.message}` };
        }

        return { success: true, user: authData.user };
    } catch (error: any) {
        console.error('Server Action Error:', error);
        return { success: false, error: error.message || 'Internal Server Error' };
    }
}
