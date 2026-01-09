import { supabase } from './supabase';

export interface WorkAssignment {
    id: string;
    organization_id: string;
    order_id: string;
    stitcher_id: string;
    assigned_by: string;
    assigned_at: string;
    started_at?: string;
    completed_at?: string;
    status: 'assigned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
    progress_percentage: number;
    estimated_hours?: number;
    actual_hours?: number;
    assignment_notes?: string;
    stitcher_notes?: string;
    quality_rating?: number;
    quality_notes?: string;
}

export interface CreateAssignmentData {
    order_id: string;
    stitcher_id: string;
    organization_id: string;
    estimated_hours?: number;
    assignment_notes?: string;
}

export const workAssignmentService = {
    /**
     * Assign order to stitcher
     */
    assignWork: async (tailorId: string, assignmentData: CreateAssignmentData) => {
        try {
            const { data, error } = await supabase
                .from('work_assignments')
                .insert([{
                    ...assignmentData,
                    assigned_by: tailorId,
                    status: 'assigned',
                    progress_percentage: 0,
                }])
                .select(`
          *,
          stitchers (id, full_name, username),
          orders (id, order_id, clothing_type, status)
        `)
                .single();

            if (error) throw error;

            // Update order with assigned stitcher
            await supabase
                .from('orders')
                .update({ assigned_stitcher_id: assignmentData.stitcher_id })
                .eq('id', assignmentData.order_id);

            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all assignments for a tailor
     */
    getAssignmentsByTailor: async (tailorId: string) => {
        try {
            const { data, error } = await supabase
                .from('work_assignments')
                .select(`
          *,
          stitchers (id, full_name, username, specialization),
          orders (id, order_id, clothing_type, status, expected_completion_date)
        `)
                .eq('assigned_by', tailorId)
                .order('assigned_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get assignments for a specific stitcher
     */
    getAssignmentsByStitcher: async (stitcherId: string) => {
        try {
            const { data, error } = await supabase
                .from('work_assignments')
                .select(`
          *,
          orders (
            id, 
            order_id, 
            clothing_type, 
            category,
            fabric_type,
            color,
            quantity,
            status, 
            expected_completion_date,
            custom_notes
          )
        `)
                .eq('stitcher_id', stitcherId)
                .in('status', ['assigned', 'in_progress'])
                .order('assigned_at', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Update assignment progress (by stitcher)
     */
    updateProgress: async (
        assignmentId: string,
        progress: number,
        notes?: string
    ) => {
        try {
            const updates: any = {
                progress_percentage: progress,
                updated_at: new Date().toISOString(),
            };

            if (notes) {
                updates.stitcher_notes = notes;
            }

            // If starting work for first time
            if (progress > 0) {
                const { data: current } = await supabase
                    .from('work_assignments')
                    .select('started_at, status')
                    .eq('id', assignmentId)
                    .single();

                if (current && !current.started_at) {
                    updates.started_at = new Date().toISOString();
                    updates.status = 'in_progress';
                }
            }

            // If completed
            if (progress === 100) {
                updates.completed_at = new Date().toISOString();
                updates.status = 'completed';
            }

            const { data, error } = await supabase
                .from('work_assignments')
                .update(updates)
                .eq('id', assignmentId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Mark assignment as complete (by tailor)
     */
    completeAssignment: async (
        assignmentId: string,
        actualHours?: number,
        qualityRating?: number,
        qualityNotes?: string
    ) => {
        try {
            const { data, error } = await supabase
                .from('work_assignments')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    actual_hours: actualHours,
                    quality_rating: qualityRating,
                    quality_notes: qualityNotes,
                    progress_percentage: 100,
                })
                .eq('id', assignmentId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get stitcher performance stats
     */
    getStitcherStats: async (stitcherId: string) => {
        try {
            const { data, error } = await supabase
                .from('work_assignments')
                .select('*')
                .eq('stitcher_id', stitcherId);

            if (error) throw error;

            const total = data?.length || 0;
            const completed = data?.filter(a => a.status === 'completed').length || 0;
            const in_progress = data?.filter(a => a.status === 'in_progress').length || 0;
            const pending = data?.filter(a => a.status === 'assigned').length || 0;

            let avg_quality = 0;
            const rated = data?.filter(a => a.quality_rating) || [];
            if (rated.length > 0) {
                avg_quality = rated.reduce((sum, a) => sum + (a.quality_rating || 0), 0) / rated.length;
            }

            const total_hours = data?.reduce((sum, a) => sum + (a.actual_hours || 0), 0) || 0;

            return {
                success: true,
                data: {
                    total_assignments: total,
                    completed,
                    in_progress,
                    pending,
                    average_quality: avg_quality,
                    total_hours
                }
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get performance stats for all stitchers under a tailor
     */
    getTailorStitcherStats: async (tailorId: string) => {
        try {
            // 1. Get all stitchers for this tailor
            const { data: stitchers, error: sError } = await supabase
                .from('stitchers')
                .select('id, full_name, specialization')
                .eq('tailor_id', tailorId);

            if (sError) throw sError;

            // 2. Get all assignments for these stitchers
            const stitcherIds = stitchers.map(s => s.id);
            const { data: assignments, error: aError } = await supabase
                .from('work_assignments')
                .select('*')
                .in('stitcher_id', stitcherIds);

            if (aError) throw aError;

            // 3. Aggregate stats
            const stats = stitchers.map(s => {
                const sAssignments = assignments.filter(a => a.stitcher_id === s.id);
                const total = sAssignments.length;
                const completed = sAssignments.filter(a => a.status === 'completed').length;
                const in_progress = sAssignments.filter(a => (a.status === 'in_progress' || a.status === 'assigned')).length;

                let avg_rating = 0;
                const rated = sAssignments.filter(a => a.quality_rating);
                if (rated.length > 0) {
                    avg_rating = rated.reduce((sum, a) => sum + (a.quality_rating || 0), 0) / rated.length;
                }

                return {
                    id: s.id,
                    full_name: s.full_name,
                    specialization: s.specialization,
                    total_count: total,
                    completed_count: completed,
                    in_progress_count: in_progress,
                    avg_rating: avg_rating
                };
            });

            return { success: true, data: stats };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Reassign work to different stitcher
     */
    reassignWork: async (assignmentId: string, newStitcherId: string) => {
        try {
            const { data, error } = await supabase
                .from('work_assignments')
                .update({
                    stitcher_id: newStitcherId,
                    status: 'assigned',
                    progress_percentage: 0,
                    started_at: null,
                })
                .eq('id', assignmentId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },
};
