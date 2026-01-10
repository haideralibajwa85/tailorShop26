import { createClient } from '@supabase/supabase-js';

// Create a function to initialize the Supabase Admin client
// This ensures the client is only created when needed and has proper env vars
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // Only warn at runtime, not during build time
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
      console.warn('Supabase Admin configuration error: Keys are missing. Ensure they are added to Vercel Settings.');
    }
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
