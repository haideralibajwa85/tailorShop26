import { createClient } from '@supabase/supabase-js';

// Create a function to initialize the Supabase Admin client
// This ensures the client is only created when needed and has proper env vars
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase Admin configuration error:\n- NEXT_PUBLIC_SUPABASE_URL is missing\n- SUPABASE_SERVICE_ROLE_KEY is missing');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Export a getter function instead of a static client
export let supabaseAdmin = createSupabaseAdminClient();

// Update the client when needed
export function getSupabaseAdminClient() {
  if (!supabaseAdmin) {
    supabaseAdmin = createSupabaseAdminClient();
  }
  return supabaseAdmin;
}
