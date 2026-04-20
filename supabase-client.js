// Supabase client initializer
// Replace the placeholders below with your values in Vercel environment or during build.
const SUPABASE_URL = 'REPLACE_ME_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'REPLACE_ME_SUPABASE_ANON_KEY';

// UMD build exposes a `supabase` object with createClient
const { createClient } = supabase || window.supabase || {};
if (typeof createClient !== 'function') {
    console.warn('Supabase UMD not found. Make sure to include the CDN script before this file.');
} else {
    window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Helper: safe flag to detect placeholder usage
window.SUPABASE_CONFIG_PLACEHOLDER = (SUPABASE_URL.startsWith('REPLACE_ME') || SUPABASE_ANON_KEY.startsWith('REPLACE_ME'));
