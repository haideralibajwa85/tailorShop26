import { createBrowserClient } from '@supabase/ssr';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client with auth persistence
// We use a safe check here because during build time, these variables might be missing
// but the modules are still analyzed by Next.js
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

if (!supabase) {
  console.warn('Supabase credentials missing. Client initialization skipped.');
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
  measurement_notes?: string;
  created_at: string;
}

export interface Staff {
  id: string;
  user_id: string;
  role: 'tailor' | 'admin';
  created_at: string;
}