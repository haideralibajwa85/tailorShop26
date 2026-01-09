'use server';

import { supabaseAdmin } from '../../lib/supabaseAdmin';

export async function createStitcherAction(data: {
    username: string;
    password: string;
    full_name: string;
    phone: string;
    tailor_id: string;
    organization_id: string;
}) {
    try {
        if (!supabaseAdmin) {
            throw new Error('Supabase Admin client not initialized');
        }
        const internalEmail = `${data.username}@worker.stitcher-mail.com`;

        // Create the user using the admin client
        // auto_confirm: true bypasses the need for the user to confirm their email
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: internalEmail,
            password: data.password,
            email_confirm: true,
            phone: data.phone,
            phone_confirm: true,
            user_metadata: {
                full_name: data.full_name,
                role: 'stitcher',
                organization_id: data.organization_id,
                phone: data.phone,
                username: data.username
            }
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return { success: false, error: authError.message };
        }

        // The user profile in public.users should be created by the on_auth_user_created trigger.
        // If the trigger doesn't exist or doesn't work with admin.createUser, 
        // we might need to manually insert it here.

        // Let's manually ensure the profile exists just in case
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: authData.user.id,
                email: internalEmail,
                full_name: data.full_name,
                phone: data.phone,
                role: 'stitcher',
                organization_id: data.organization_id,
                is_active: true
            });

        if (profileError) {
            console.error('Profile Error:', profileError);
            // We don't necessarily want to fail here if the user was created, 
            // but the profile insert failed. However, for a clean state, we report it.
            return { success: false, error: `User created but profile failed: ${profileError.message}` };
        }

        // Ensure email and phone are confirmed (safety check)
        // This guarantees stitchers can login immediately without verification
        await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
            email_confirm: true,
            phone_confirm: true
        });

        return { success: true, user: authData.user };
    } catch (error: any) {
        console.error('Server Action Error:', error);
        return { success: false, error: error.message || 'Internal Server Error' };
    }
}
