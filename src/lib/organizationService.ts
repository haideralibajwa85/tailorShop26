import { supabase } from './supabase';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    business_name?: string;
    business_address?: string;
    business_phone?: string;
    business_email?: string;
    logo_url?: string;
    subscription_plan: string;
    subscription_status: string;
    is_active: boolean;
}

export const organizationService = {
    /**
     * Get organization by ID
     */
    getById: async (orgId: string) => {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', orgId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get organization by slug
     */
    getBySlug: async (slug: string) => {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all active organizations (for registration dropdown)
     */
    getAllActive: async () => {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name, slug')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Create organization (superadmin only)
     */
    create: async (orgData: Partial<Organization>, superadminId: string) => {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .insert([{
                    ...orgData,
                    created_by: superadminId,
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
     * Update organization
     */
    update: async (orgId: string, updates: Partial<Organization>) => {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', orgId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get organization users count
     */
    getUserCounts: async (orgId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('organization_id', orgId);

            if (error) throw error;

            const counts = {
                admin: 0,
                tailor: 0,
                customer: 0,
                total: data.length,
            };

            data.forEach(user => {
                if (user.role in counts) {
                    counts[user.role as keyof typeof counts]++;
                }
            });

            return { success: true, data: counts };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },
};
