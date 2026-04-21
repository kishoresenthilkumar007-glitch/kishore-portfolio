// Supabase client initializer
// Try multiple locations for configuration so this file works in many setups:
// - `window.SUPABASE_URL` / `window.SUPABASE_ANON_KEY` (recommended for simple deployments)
// - `window.__env` object (sometimes used for injected globals)
// - `import.meta.env` (Vite / modern bundlers)
// - `process.env` (build-time in Node environments)
// Fallback to placeholder strings so the UI can surface a helpful message.
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

const SUPABASE_URL = readEnv('SUPABASE_URL', 'VITE_SUPABASE_URL') || 'https://kbxyqbnqflrojjbcutqr.supabase.co';
const SUPABASE_ANON_KEY = readEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHlxYm5xZmxyb2pqYmN1dHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY4NDc0OSwiZXhwIjoyMDkyMjYwNzQ5fQ.MZgRK52x91qFqPsXYmXJxZC2FDjHAepRpFLGts0Gx_Y';

// Safe feature-detection without referencing possibly-undefined globals
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

// Helper: safe flag to detect placeholder usage
try {
    window.SUPABASE_CONFIG_PLACEHOLDER = (
        !SUPABASE_URL || !SUPABASE_ANON_KEY ||
        (typeof SUPABASE_URL === 'string' && SUPABASE_URL.startsWith('REPLACE_ME')) ||
        (typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY.startsWith('REPLACE_ME'))
    );
} catch (e) {
    /* noop */
}
