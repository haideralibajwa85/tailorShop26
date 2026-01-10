import { getSupabaseClient } from './src/lib/supabase';

async function diagnose() {
    console.log('--- Order Diagnostic ---');

    const supabase = getSupabaseClient();
    
    if (!supabase) {
        console.error('Supabase client is not available. Make sure environment variables are set properly.');
        return;
    }

    // 1. Get the latest order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (orderError) {
        console.error('Error fetching order:', orderError.message);
        return;
    }

    console.log('Latest Order:', {
        id: order.id,
        order_id: order.order_id,
        status: order.status
    });

    // 2. Get associated measurements
    const { data: measurements, error: measError } = await supabase
        .from('order_measurements')
        .select('*')
        .eq('order_id', order.id)
        .single();

    if (measError) {
        console.error('Error fetching measurements:', measError.message);
    } else {
        console.log('Measurements found:', measurements);
    }

    // 3. Check for any RLS policies (diagnostic)
    const { data: policies, error: polError } = await supabase
        .rpc('get_policies'); // This might not work if RPC not defined

    if (polError) {
        console.log('Could not fetch policies via RPC (expected if not defined)');
    }
}

diagnose();
