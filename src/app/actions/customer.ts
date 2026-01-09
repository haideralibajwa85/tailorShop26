'use server';

import { supabaseAdmin } from '../../lib/supabaseAdmin';

export async function createCustomerAction(data: {
    full_name: string;
    phone: string;
    email: string; // generated or provided
    address: string;
    organization_id: string;
    role?: 'customer';
}) {
    try {
        console.log('Creating customer with data:', data);

        // 1. Create the user in Supabase Auth
        // We use a dummy password as they will likely login via OTP or link later.
        // For now, we set a default capable of being changed or ignored.
        // We auto-confirm email to allow immediate "active" status.
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: 'Customer@123', // Default, should be changed or OTP used
            email_confirm: true,
            user_metadata: {
                full_name: data.full_name,
                phone: data.phone,
                role: 'customer',
                organization_id: data.organization_id
            }
        });

        if (authError) {
            console.error('Auth Creation Error:', authError);
            return { success: false, error: authError.message };
        }

        if (!authData.user) {
            return { success: false, error: 'Failed to generate user ID' };
        }

        // 2. Create the profile in public.users
        // RLS policies might block "tailor" from inserting, so we use admin client here too
        // to ensure it works 100%.
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: authData.user.id,
                email: data.email,
                full_name: data.full_name,
                phone: data.phone,
                address: data.address,
                role: 'customer',
                organization_id: data.organization_id,
                is_active: true
            });

        if (profileError) {
            console.error('Profile Creation Error:', profileError);
            // Cleanup auth user?
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return { success: false, error: profileError.message };
        }

        return { success: true, user: authData.user };

    } catch (error: any) {
        console.error('Server Action Error:', error);
        return { success: false, error: error.message || 'Internal Server Error' };
    }
}
