import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'portofolio';

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Extract the storage path from a full Supabase public URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/portfolio/profile/123_avatar.jpg"
 *   → "profile/123_avatar.jpg"
 */
function extractStoragePath(publicUrl) {
    if (!publicUrl) return null;
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.substring(idx + marker.length);
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'certificates';
        const oldUrl = formData.get('oldUrl') || '';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const supabase = getSupabase();

        // Delete old file if provided
        if (oldUrl) {
            const oldPath = extractStoragePath(oldUrl);
            if (oldPath) {
                await supabase.storage.from(BUCKET).remove([oldPath]);
                console.log('[Upload API] Deleted old file:', oldPath);
            }
        }

        // Prepare file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        const fileName = `${folder}/${timestamp}_${originalName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, buffer, {
                contentType: file.type || 'application/octet-stream',
                upsert: false,
            });

        if (error) {
            console.error('[Upload API] Supabase upload error:', error);
            throw new Error(error.message);
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

        return NextResponse.json({ url: urlData.publicUrl, path: data.path });
    } catch (error) {
        console.error('[Upload API] Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
