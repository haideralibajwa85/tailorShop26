import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create client with safe check for build time
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : (null as any);

if (!supabaseAdmin) {
    console.error('Supabase Admin configuration error:');
    if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL is missing');
    if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY is missing');
}
