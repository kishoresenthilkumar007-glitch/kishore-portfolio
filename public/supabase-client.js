// Supabase client initializer (public copy)
function readEnv(name, alt) {
    try {
        if (typeof window !== 'undefined') {
            if (window[name]) return window[name];
            if (window.__env && window.__env[name]) return window.__env[name];
        }
        if (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env) {
            if (import.meta.env[name]) return import.meta.env[name];
            if (import.meta.env[alt]) return import.meta.env[alt];
        }
        if (typeof process !== 'undefined' && process.env) {
            if (process.env[name]) return process.env[name];
            if (process.env[alt]) return process.env[alt];
        }
    } catch (e) {
        // ignore and fallback
    }
    return null;
}

const SUPABASE_URL = readEnv('SUPABASE_URL', 'VITE_SUPABASE_URL') || 'REPLACE_ME_SUPABASE_URL';
const SUPABASE_ANON_KEY = readEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') || 'REPLACE_ME_SUPABASE_ANON_KEY';
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
try {
    window.SUPABASE_CONFIG_PLACEHOLDER = (
        !SUPABASE_URL || !SUPABASE_ANON_KEY ||
        (typeof SUPABASE_URL === 'string' && SUPABASE_URL.startsWith('REPLACE_ME')) ||
        (typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY.startsWith('REPLACE_ME'))
    );
} catch (e) {
    /* noop */
}
