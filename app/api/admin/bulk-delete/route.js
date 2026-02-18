import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    try {
        const { table, ids } = await request.json();

        const allowedTables = ['skills', 'projects', 'certificates', 'experience', 'education'];
        if (!allowedTables.includes(table)) {
            return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
        }

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
        }

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const key = serviceKey || anonKey;

        const supabase = createClient(url, key, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data, error } = await supabase
            .from(table)
            .delete()
            .in('id', ids)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, deleted: data?.length || 0 });
    } catch (err) {
        console.error('[Bulk Delete API] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
