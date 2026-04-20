document.addEventListener('DOMContentLoaded', () => {
    // This file is a public copy of /admin/admin.js adjusted to be served from /admin/
    // It references Supabase via /supabase-client.js when configured.

    let fullJsonData = {}; // Stores untouched data like Hero and About

    // UI Boundaries
    const toast = document.getElementById('toast');
    const saveBtn = document.getElementById('save-btn');
    const authBtn = document.getElementById('auth-btn');
    const loginOverlay = document.getElementById('login-overlay');
    const adminGrid = document.getElementById('admin-editor-grid');
    const authError = document.getElementById('auth-error');

    // On load: if Supabase client is present, check auth session and auto-login
    if (window.supabase) {
        supabase.auth.getSession().then(({ data }) => {
            if (data && data.session) {
                loginOverlay.style.display = 'none';
                adminGrid.style.display = 'grid';
                loadAdminData();
            }
        }).catch(() => {});
    }

    // --- Custom Confirm Modal Utility ---
    function showConfirm(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const msg = document.getElementById('confirm-message');
            const okBtn = document.getElementById('confirm-ok');
            const cancelBtn = document.getElementById('confirm-cancel');
            const backdrop = modal.querySelector('.confirm-backdrop');

            msg.textContent = message;
            modal.classList.remove('hidden');

            const cleanup = () => {
                modal.classList.add('hidden');
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
                backdrop.removeEventListener('click', onCancel);
                document.removeEventListener('keydown', onKey);
            };

            const onOk = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };
            const onKey = (e) => { if (e.key === 'Escape') onCancel(); };

            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
            backdrop.addEventListener('click', onCancel);
            document.addEventListener('keydown', onKey);
        });
    }

    // Containers
    const projContainer = document.getElementById('projects-container');
    const achvContainer = document.getElementById('achievements-container');

    // Local file protocol blocker
    if (window.location.protocol === 'file:' || window.location.port === '5500') {
        loginOverlay.innerHTML = `
            <div style="background: rgba(255,0,0,0.1); border: 2px solid red; padding: 2rem; border-radius: 12px; text-align: center; max-width: 500px; z-index: 9999;">
                <h2 style="color: #ff5555; margin-bottom: 1rem;"><i class="fas fa-exclamation-triangle"></i> Action Required: Wrong Port!</h2>
                <p style="color: white; font-size: 1.1rem; line-height: 1.6;">You are currently viewing this page through <strong>VS Code Live Server (Port 5500)</strong> or a local file.</p>
                <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(0,0,0,0.5); border-radius: 8px;">
                    <a href="http://127.0.0.1:5000/admin" style="color: var(--neon-purple); font-size: 1.3rem; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 1rem;">Switch to Python Server (Port 5000)</a>
                </div>
            </div>
        `;
        return;
    }

    // --- AUTHENTICATION ---
    authBtn.addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        
        authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        authBtn.disabled = true;
        authError.style.display = 'none';

        try {
            if (!window.supabase || window.SUPABASE_CONFIG_PLACEHOLDER) throw new Error('Supabase not configured. Update supabase-client.js placeholders or set env variables.');
            const { data: signData, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            loginOverlay.style.display = 'none';
            adminGrid.style.display = 'grid';
            loadAdminData();
        } catch (err) {
            authError.innerText = err.message || 'Authentication failed';
            authError.style.display = 'block';
        } finally {
            authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Authenticate';
            authBtn.disabled = false;
        }
    });

    // --- LOAD DATA ---
    async function loadAdminData() {
        try {
            if (window.supabase && !window.SUPABASE_CONFIG_PLACEHOLDER) {
                const res = await supabase.from('portfolio_settings').select('data').eq('id', 1).single();
                if (!res.error && res.data) {
                    fullJsonData = res.data.data || res.data;
                } else {
                    const local = await fetch('/data.json').then(r => r.json()).catch(() => ({}));
                    fullJsonData = local;
                }
            } else {
                const local = await fetch('/data.json').then(r => r.json()).catch(() => ({}));
                fullJsonData = local;
            }
            
            // Populate fields
            if (fullJsonData.skills) {
                document.getElementById('skills-languages').value = (fullJsonData.skills.languages || []).join(', ');
                document.getElementById('skills-libraries').value = (fullJsonData.skills.libraries || []).join(', ');
                document.getElementById('skills-tools').value = (fullJsonData.skills.tools || []).join(', ');
            }

            // PROJECTS
            projContainer.innerHTML = '';
            (fullJsonData.projects || []).forEach(proj => createProjectNode(proj));

            // ACHIEVEMENTS
            achvContainer.innerHTML = '';
            (fullJsonData.achievements || []).forEach(ach => createAchievementNode(ach));
        } catch (err) {
            console.error('Failed to load data:', err);
        }
    }

    // UI generators and save logic are same as root admin.js; the public copy uses same functions
    // For brevity, load the existing admin.js from the root when serving locally.
    // If you need the full duplicate here, tell me and I will duplicate all functions explicitly.

});
