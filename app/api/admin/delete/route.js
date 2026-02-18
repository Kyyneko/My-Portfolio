import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    try {
        const { table, id } = await request.json();

        // Validate table name
        const allowedTables = ['skills', 'projects', 'certificates', 'experience', 'education'];
        if (!allowedTables.includes(table)) {
            return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
        }

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        console.log('[Delete API] URL:', url ? 'SET' : 'MISSING');
        console.log('[Delete API] Service Key:', serviceKey ? `SET (${serviceKey.substring(0, 20)}...)` : 'MISSING');
        console.log('[Delete API] Using:', serviceKey ? 'SERVICE_ROLE' : 'ANON');

        const key = serviceKey || anonKey;
        const supabase = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        console.log(`[Delete API] Deleting from "${table}" where id = ${id}`);

        const { data, error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)
            .select();

        console.log('[Delete API] Result data:', JSON.stringify(data));
        console.log('[Delete API] Result error:', JSON.stringify(error));

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            console.log('[Delete API] WARNING: No rows were deleted! Possible RLS issue.');
            return NextResponse.json({
                error: 'No rows deleted. Check RLS policies in Supabase.',
                hint: 'Go to Supabase → Table → RLS and add a DELETE policy or disable RLS.'
            }, { status: 400 });
        }

        return NextResponse.json({ success: true, deleted: data });
    } catch (err) {
        console.error('[Delete API] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
