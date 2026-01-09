'use server';

import { supabaseAdmin } from '../../lib/supabaseAdmin';

export async function getEmailByPhone(phone: string) {
    try {
        if (!supabaseAdmin) {
            throw new Error('Supabase Admin client not initialized');
        }
        // Use admin client to bypass RLS
        // Sanitize phone number: remove spaces, dashes, etc. kept only digits and +
        const sanitizedPhone = phone.replace(/[\s-]/g, '');

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('phone', sanitizedPhone)
            .single();

        if (error) {
            console.error('Error fetching user by phone:', error);
            return { success: false, error: error.message };
        }

        if (!user || !user.email) {
            return { success: false, error: 'No account found with this phone number' };
        }

        return { success: true, email: user.email };
    } catch (error: any) {
        console.error('Server Action Error:', error);
        return { success: false, error: error.message || 'Internal Server Error' };
    }
}
