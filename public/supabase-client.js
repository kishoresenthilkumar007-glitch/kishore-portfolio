// Supabase client initializer (public copy)
const SUPABASE_URL = 'REPLACE_ME_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'REPLACE_ME_SUPABASE_ANON_KEY';
try {
    const createClientFn = (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function')
        ? window.supabase.createClient
        : (typeof window !== 'undefined' && typeof window.createClient === 'function') ? window.createClient : null;

    if (createClientFn) {
        window.supabase = createClientFn(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn('Supabase UMD not found. Make sure to include the CDN script before this file.');
    }
} catch (e) {
    console.warn('Error initializing supabase client:', e);
}
window.SUPABASE_CONFIG_PLACEHOLDER = (typeof SUPABASE_URL === 'string' && SUPABASE_URL.startsWith('REPLACE_ME')) || (typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY.startsWith('REPLACE_ME'));
