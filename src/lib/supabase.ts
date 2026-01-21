import { createBrowserClient } from '@supabase/ssr';

// Create a function to initialize the Supabase client
// This ensures the client is only created in the browser environment
export function createSupabaseClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    console.warn(`Supabase Configuration Error: The following variables are missing from your environment: ${missing.join(', ')}. 
Please check your .env.local file. See docs/FIX_SUPABASE_CONFIG.md for more info.`);
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Export a variable that is cast to the expected type to avoid "possibly null" errors
// across the project. At runtime it may still be null on the server, but client-side
// code will work correctly if environment variables are set.
export let supabase = createSupabaseClient() as NonNullable<ReturnType<typeof createSupabaseClient>>;

// Update the client when needed
export function getSupabaseClient() {
  if (!supabase) {
    supabase = createSupabaseClient() as NonNullable<ReturnType<typeof createSupabaseClient>>;
  }
  return supabase;
}

// Type definitions for our database
export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  language_preference: string;
  gender: string;
  address?: string;
  role: 'superadmin' | 'admin' | 'tailor' | 'customer';
  organization_id?: string; // NULL for superadmin, required for others
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface ClothingType {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_id: string;
  customer_id: string;
  category: string;
  clothing_type: string;
  gender: string;
  quantity: number;
  fabric_type: string;
  color: string;
  stitching_style: string;
  design_reference_url?: string;
  custom_notes?: string;
  order_date: string;
  expected_completion_date: string;
  actual_completion_date?: string;
  pickup_date?: string;
  status: 'pending' | 'in_stitching' | 'completed' | 'late' | 'completed_not_picked' | 'delivered' | 'cancelled';
  organization_id?: string;
  tailor_id?: string;
  total_amount?: number;
  advance_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface OrderExtraCharge {
  id: string;
  order_id: string;
  amount: number;
  description: string;
  created_at: string;
}

export interface OrderMeasurement {
  id: string;
  order_id: string;
  chest: string;
  waist: string;
  hip: string;
  shoulder: string;
  sleeve_length: string;
  shirt_length: string;
  trouser_length: string;
  neck: string;
  bicep?: string;
  cuff?: string;
  seat?: string;
  knee?: string;
  ankle?: string;
  armhole?: string;
  collar_size?: string;
  front_patti_length?: string;
  side_chak_length?: string;
  daman_width?: string;
  fit_type?: string;
  collar_style?: string;
  sleeve_style?: string;
  daman_style?: string;
  pocket_kameez?: string;
  thigh?: string;
  shalwar_type?: string;
  waist_style?: string;
  pocket_type?: string;
  measurement_notes?: string;
  created_at: string;
}

export interface Staff {
  id: string;
  user_id: string;
  role: 'tailor' | 'admin';
  created_at: string;
}