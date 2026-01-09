import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ success: false, error: 'Supabase credentials missing' }, { status: 500 });
        }

        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const targetId = 'fb24180d-853b-4aa5-9d8d-5b1c442ec6d5';
        const dummyEmail = `test_conflict_${Date.now()}@example.com`;

        console.log(`API: Testing creation with ID ${targetId} and dummy email...`);

        const { data, error } = await adminClient.auth.admin.createUser({
            id: targetId,
            email: dummyEmail,
            password: 'TemporaryPass123!',
            email_confirm: true
        });

        if (error) {
            return NextResponse.json({
                test: 'ID conflict test',
                success: false,
                error: error.message,
                hint: 'If this fails with database error, the ID is already taken in auth.users (hidden)'
            });
        }

        return NextResponse.json({
            test: 'ID conflict test',
            success: true,
            message: 'ID is available. The conflict is likely the email.',
            user: data.user
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
