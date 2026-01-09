import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase Admin client not initialized');
            return NextResponse.json({ success: false, error: 'Internal Server Error: Supabase Admin client not initialized' }, { status: 500 });
        }
        console.log('Seeding lookup data...');

        // 1. Categories
        const categories = [
            'Shalwar Kameez',
            'Saudi Traditional Wear',
            'Thobe',
            'Waistcoat',
            'Abaya',
            'Other'
        ];

        const categoryMap = new Map();

        for (const catName of categories) {
            const { data, error } = await supabaseAdmin
                .from('categories')
                .upsert({ name: catName }, { onConflict: 'name' })
                .select()
                .single();

            if (error) {
                console.error(`Error upserting category ${catName}:`, error);
                throw error;
            }
            categoryMap.set(catName, data.id);
        }

        // 2. Clothing Types
        const clothingTypes = [
            { cat: 'Shalwar Kameez', names: ['Simple Shalwar Kameez', 'Designer Shalwar Kameez'] },
            { cat: 'Saudi Traditional Wear', names: ['Simple Thobe', 'Embroidered Thobe'] },
            { cat: 'Thobe', names: ['Standard Thobe'] },
            { cat: 'Waistcoat', names: ['Plain Waistcoat', 'Banarasi Waistcoat'] },
            { cat: 'Abaya', names: ['Simple Abaya', 'Designer Abaya'] },
            { cat: 'Other', names: ['Custom'] }
        ];

        let createdCount = 0;

        for (const group of clothingTypes) {
            const catId = categoryMap.get(group.cat);
            if (!catId) continue;

            for (const typeName of group.names) {
                // Upsert requires a unique constraint usually, but we might not have one on (name, category_id).
                // We'll check first to be safe.
                const { data: existing } = await supabaseAdmin
                    .from('clothing_types')
                    .select('id')
                    .eq('name', typeName)
                    .eq('category_id', catId)
                    .single();

                if (!existing) {
                    const { error } = await supabaseAdmin
                        .from('clothing_types')
                        .insert({ name: typeName, category_id: catId });

                    if (error) {
                        console.error(`Error inserting type ${typeName}:`, error);
                    } else {
                        createdCount++;
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Seeding complete. Processed ${categories.length} categories and ${createdCount} new types.`
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
