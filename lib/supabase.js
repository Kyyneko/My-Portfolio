import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create the real client if credentials are provided
const isConfigured = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here';

// Create a chainable dummy result that supports all query chain patterns:
// .select().eq().single(), .select().order(), .delete().eq().select(), etc.
const createDummyChain = (defaultResult = { data: [], error: null }) => {
    const chain = {
        select: () => chain,
        single: () => Promise.resolve({ data: null, error: null }),
        eq: () => chain,
        neq: () => chain,
        in: () => chain,
        order: () => chain,
        limit: () => chain,
        range: () => chain,
        filter: () => chain,
        match: () => chain,
        // When awaited directly (e.g. const { data } = await supabase.from(...).select())
        then: (resolve) => resolve(defaultResult),
    };
    return chain;
};

// Create a dummy client for build time / when not configured
const dummyClient = {
    from: () => ({
        select: () => createDummyChain({ data: [], error: null }),
        upsert: () => createDummyChain({ data: null, error: null }),
        insert: () => createDummyChain({ data: null, error: null }),
        update: () => createDummyChain({ data: null, error: null }),
        delete: () => createDummyChain({ data: null, error: null }),
    }),
    auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    },
};

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : dummyClient;

export const isSupabaseConfigured = () => isConfigured;
