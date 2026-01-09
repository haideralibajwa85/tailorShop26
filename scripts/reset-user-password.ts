import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetPassword() {
    console.log('Attempting to reset password for bajwa.376@gmail.com...');

    // 1. Get user ID
    const { data: { users }, error: getError } = await supabaseAdmin.auth.admin.listUsers();
    if (getError) {
        console.error('Error listing users:', getError.message);
        return;
    }

    const user = users.find(u => u.email === 'bajwa.376@gmail.com');
    if (!user) {
        console.error('User not found in Supabase Auth.');
        return;
    }

    console.log('User found with ID:', user.id);

    // 2. Update password
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: 'Qwe85rty@#$%^&' }
    );

    if (updateError) {
        console.error('Error updating password:', updateError.message);
    } else {
        console.log('Password successfully updated for:', user.email);
        console.log('You can now log in with the new password.');
    }
}

resetPassword();
