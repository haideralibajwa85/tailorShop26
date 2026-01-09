import { supabase } from './supabase';
import { createStitcherAction } from '../app/actions/stitcher';

export interface Stitcher {
    id: string;
    organization_id: string;
    tailor_id: string;
    username: string;
    full_name: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
}

export const stitcherService = {
    /**
     * Create a new stitcher
     * This involves:
     * 1. Creating an auth user with username@stitcher.internal
     * 2. Inserting into public.users with role 'stitcher'
     */
    createStitcher: async (data: {
        username: string;
        password: string;
        full_name: string;
        phone: string;
        tailor_id: string;
        organization_id: string;
    }) => {
        return await createStitcherAction(data);
    },

    /**
     * Get stitchers for a specific tailor
     */
    getStitchersByTailor: async (tailorId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'stitcher')
                // This assumes we have a way to track which tailor manages which stitcher
                // In a simple system, they share the same organization_id
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
};
