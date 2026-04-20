// Lightweight inline auth helper to ensure the Authenticate button works
window.inlineAdminAuth = async function() {
    const emailEl = document.getElementById('auth-email');
    const passEl = document.getElementById('auth-password');
    const authError = document.getElementById('auth-error');
    const authBtn = document.getElementById('auth-btn');
    if (!authBtn || !emailEl || !passEl) return;
    const email = emailEl.value;
    const password = passEl.value;

    authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    authBtn.disabled = true;
    if (authError) authError.style.display = 'none';

    try {
        if (!window.supabase || window.SUPABASE_CONFIG_PLACEHOLDER) throw new Error('Supabase not configured. Update supabase-client.js placeholders or set env variables.');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const loginOverlay = document.getElementById('login-overlay');
        const adminGrid = document.getElementById('admin-editor-grid');
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (adminGrid) adminGrid.style.display = 'grid';
        // After successful auth, try loading admin data if function available
        if (typeof loadAdminData === 'function') loadAdminData();
    } catch (err) {
        if (authError) {
            authError.innerText = err.message || 'Authentication failed';
            authError.style.display = 'block';
        }
    } finally {
        authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Authenticate';
        authBtn.disabled = false;
    }
};

// Attach a delegated listener so clicks work even if admin.js fails to initialize
document.addEventListener('click', (ev) => {
    const target = ev.target.closest && ev.target.closest('#auth-btn');
    if (target) {
        ev.preventDefault();
        window.inlineAdminAuth();
    }
});
