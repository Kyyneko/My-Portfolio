import { supabase, isSupabaseConfigured } from './supabase';

// ============ DEFAULT EMPTY DATA ============

const emptyProfile = {
    id: 1, name_en: '', name_id: '', title_en: '', title_id: '',
    bio_en: '', bio_id: '', avatar_url: '', resume_url: '',
    email: '', github: '', linkedin: '', instagram: '',
};

// ============ DATA FETCHING ============

export async function getProfile() {
    if (!isSupabaseConfigured()) return emptyProfile;
    const { data, error } = await supabase.from('profile').select('*').single();
    if (error || !data) return emptyProfile;
    return data;
}

export async function getSkills() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('skills').select('*').order('sort_order');
    if (error) return [];
    return data || [];
}

export async function getProjects() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('projects').select('*').order('sort_order');
    if (error) return [];
    return data || [];
}

export async function getCertificates() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('certificates').select('*').order('sort_order');
    if (error) return [];
    return data || [];
}

export async function getExperience() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('experience').select('*').order('sort_order');
    if (error) return [];
    return data || [];
}

export async function getEducation() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('education').select('*').order('sort_order');
    if (error) return [];
    return data || [];
}

// ============ ADMIN MUTATIONS ============

export async function updateProfile(profileData) {
    const { data, error } = await supabase
        .from('profile')
        .upsert({ id: 1, ...profileData })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function upsertSkill(skill) {
    const { data, error } = await supabase.from('skills').upsert(skill).select().single();
    if (error) throw error;
    return data;
}

export async function deleteSkill(id) {
    const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'skills', id }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Delete failed');
    return result;
}

export async function upsertProject(project) {
    const { data, error } = await supabase.from('projects').upsert(project).select().single();
    if (error) throw error;
    return data;
}

export async function deleteProject(id) {
    const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'projects', id }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Delete failed');
    return result;
}

export async function upsertCertificate(cert) {
    const { data, error } = await supabase.from('certificates').upsert(cert).select().single();
    if (error) throw error;
    return data;
}

export async function deleteCertificate(id) {
    const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'certificates', id }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Delete failed');
    return result;
}

export async function upsertExperience(exp) {
    const { data, error } = await supabase.from('experience').upsert(exp).select().single();
    if (error) throw error;
    return data;
}

export async function deleteExperience(id) {
    const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'experience', id }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Delete failed');
    return result;
}

export async function upsertEducation(edu) {
    const { data, error } = await supabase.from('education').upsert(edu).select().single();
    if (error) throw error;
    return data;
}

export async function deleteEducation(id) {
    const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'education', id }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Delete failed');
    return result;
}

// ============ BULK DELETE ============

export async function bulkDelete(table, ids) {
    const res = await fetch('/api/admin/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, ids }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Bulk delete failed');
    return result;
}

// ============ AUTH ============

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}
