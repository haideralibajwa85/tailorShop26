import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface StitcherLoginResult {
    success: boolean;
    stitcher?: any;
    error?: string;
}

export interface CreateStitcherData {
    username: string;
    password: string;
    full_name: string;
    phone?: string;
    address?: string;
    hourly_rate?: number;
    specialization?: string;
    organization_id: string;
}

export const stitcherAuth = {
    /**
     * Login stitcher with UserID/password
     */
    login: async (username: string, password: string): Promise<StitcherLoginResult> => {
        try {
            // Map UserID to internal email
            const internalEmail = `${username}@worker.stitcher-mail.com`;

            // Use Supabase Auth for matching session
            const { data, error } = await supabase.auth.signInWithPassword({
                email: internalEmail,
                password: password,
            });

            if (error) {
                return { success: false, error: 'Invalid UserID or password' };
            }

            return { success: true, stitcher: data.user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Create stitcher (by tailor only)
     */
    createStitcher: async (tailorId: string, stitcherData: CreateStitcherData) => {
        try {
            // Hash password
            const passwordHash = await bcrypt.hash(stitcherData.password, 10);

            const { password, ...dataWithoutPassword } = stitcherData;

            const { data, error } = await supabase
                .from('stitchers')
                .insert([{
                    ...dataWithoutPassword,
                    password_hash: passwordHash,
                    tailor_id: tailorId,
                    created_by: tailorId,
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all stitchers for a tailor (using organization_id)
     */
    getStitchersByTailor: async (tailorId: string) => {
        try {
            // 1. Get tailor's organization_id
            const { data: tailor } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', tailorId)
                .single();

            if (!tailor?.organization_id) return { success: true, data: [] };

            // 2. Fetch all users with role 'stitcher' in that organization
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'stitcher')
                .eq('organization_id', tailor.organization_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Update stitcher details
     */
    updateStitcher: async (stitcherId: string, updates: any) => {
        try {
            // We only update public.users fields
            const { data, error } = await supabase
                .from('users')
                .update({
                    full_name: updates.full_name,
                    phone: updates.phone,
                    address: updates.address,
                    // Handle specialization mapping to a metadata or custom field if exists
                    // For now, these are the core fields
                })
                .eq('id', stitcherId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Deactivate stitcher
     */
    deactivateStitcher: async (stitcherId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ is_active: false })
                .eq('id', stitcherId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Activate stitcher
     */
    activateStitcher: async (stitcherId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ is_active: true })
                .eq('id', stitcherId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },
};
