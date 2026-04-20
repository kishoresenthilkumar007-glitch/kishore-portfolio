document.addEventListener('DOMContentLoaded', () => {
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
            // Prefer Supabase if configured
            if (window.supabase && !window.SUPABASE_CONFIG_PLACEHOLDER) {
                const res = await supabase.from('portfolio_settings').select('data').eq('id', 1).single();
                if (!res.error && res.data) {
                    fullJsonData = res.data.data || res.data;
                } else {
                    // fallback to local file
                    const local = await fetch('/data.json').then(r => r.json()).catch(() => ({}));
                    fullJsonData = local;
                }
            } else {
                const local = await fetch('/data.json').then(r => r.json()).catch(() => ({}));
                fullJsonData = local;
            }
            
            // SKILLS
            if (fullJsonData.skills) {
                    document.getElementById('skills-languages').value = (data.skills.languages || []).join(', ');
                    document.getElementById('skills-libraries').value = (data.skills.libraries || []).join(', ');
                    document.getElementById('skills-tools').value = (data.skills.tools || []).join(', ');
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

    // --- UI GENERATORS ---

    document.getElementById('add-proj-btn').addEventListener('click', () => createProjectNode());
    document.getElementById('add-achv-btn').addEventListener('click', () => createAchievementNode());

    function createProjectNode(projData = null) {
        const div = document.createElement('div');
        div.className = 'dynamic-item proj-item';
        
        let existingPreview = '';
        if (projData && projData.image) {
            const src = projData.image.startsWith('data:') ? projData.image : '/' + projData.image; 
            existingPreview = `<div class="image-preview-container"><img src="${src}" /></div>`;
        }

        div.innerHTML = `
            <button class="remove-btn" title="Remove Project"><i class="fas fa-times"></i></button>
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="glass-input p-title" value="${projData ? projData.title : ''}" placeholder="Project Name">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea rows="3" class="glass-input p-desc" placeholder="What did you build?">${projData ? projData.description : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Link / URL</label>
                <input type="text" class="glass-input p-link" value="${projData ? projData.link : '#'}" placeholder="https://github.com/...">
            </div>
            <div class="form-group">
                <label>FontAwesome Icon Code (Fallback)</label>
                <input type="text" class="glass-input p-icon" value="${projData ? projData.icon : 'fa-code'}" placeholder="fa-brain">
            </div>
            <div class="form-group">
                <label>Tech Stack (comma separated)</label>
                <input type="text" class="glass-input p-tech" value="${projData ? (projData.tech || []).join(', ') : ''}" placeholder="Python, React, SQL">
            </div>
            <div class="form-group">
                <label>Project Image Upload</label>
                <input type="file" class="glass-input p-file" accept="image/*">
                <input type="hidden" class="p-image-data" value="${projData ? (projData.image || '') : ''}">
                ${existingPreview}
            </div>
        `;

        // Handle Image Upload Conversion
        const fileInput = div.querySelector('.p-file');
        const dataInput = div.querySelector('.p-image-data');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    dataInput.value = evt.target.result;
                    let preview = div.querySelector('.image-preview-container');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'image-preview-container';
                        fileInput.parentNode.appendChild(preview);
                    }
                    preview.innerHTML = `<img src="${evt.target.result}" />`;
                };
                reader.readAsDataURL(file);
            }
        });

        div.querySelector('.remove-btn').addEventListener('click', async () => {
            const ok = await showConfirm('Remove this project permanently?');
            if (ok) {
                div.remove();
                document.getElementById('save-btn').click();
            }
        });
        projContainer.appendChild(div);
    }

    function createAchievementNode(achData = null) {
        const div = document.createElement('div');
        div.className = 'dynamic-item achv-item';
        
        let existingPreview = '';
        if (achData && achData.image) {
            // Can be a raw filename like certi1.png or a base64 string
            const src = achData.image.startsWith('data:') ? achData.image : '/' + achData.image; 
            existingPreview = `<div class="image-preview-container"><img src="${src}" /></div>`;
        }

        div.innerHTML = `
            <button class="remove-btn" title="Remove Achievement"><i class="fas fa-times"></i></button>
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="glass-input a-title" value="${achData ? achData.title : ''}" placeholder="Certificate Name">
            </div>
            <div class="form-group">
                <label>Year / Date</label>
                <input type="text" class="glass-input a-date" value="${achData ? achData.date : ''}" placeholder="2025">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea rows="3" class="glass-input a-desc" placeholder="Details about this achievement...">${achData ? achData.description : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Image Upload</label>
                <input type="file" class="glass-input a-file" accept="image/*">
                <!-- Hidden input stores the active image string (filename or base64) -->
                <input type="hidden" class="a-image-data" value="${achData ? achData.image : ''}">
                ${existingPreview}
            </div>
        `;

        // Handle Image Upload Conversion
        const fileInput = div.querySelector('.a-file');
        const dataInput = div.querySelector('.a-image-data');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    dataInput.value = evt.target.result; // Store base64 securely
                    // Update preview block
                    let preview = div.querySelector('.image-preview-container');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'image-preview-container';
                        fileInput.parentNode.appendChild(preview);
                    }
                    preview.innerHTML = `<img src="${evt.target.result}" />`;
                };
                reader.readAsDataURL(file);
            }
        });

        div.querySelector('.remove-btn').addEventListener('click', async () => {
            const ok = await showConfirm('Remove this achievement permanently?');
            if (ok) {
                div.remove();
                document.getElementById('save-btn').click();
            }
        });
        achvContainer.appendChild(div);
    }

    // --- SAVE LOGIC ---
    saveBtn.addEventListener('click', async () => {
        // Build SKILLS
        const skillsLanguages = document.getElementById('skills-languages').value.split(',').map(s => s.trim()).filter(s => s);
        const skillsLibraries = document.getElementById('skills-libraries').value.split(',').map(s => s.trim()).filter(s => s);
        const skillsTools = document.getElementById('skills-tools').value.split(',').map(s => s.trim()).filter(s => s);

        // Build PROJECTS
        const projects = Array.from(document.querySelectorAll('.proj-item')).map(item => {
            return {
                title: item.querySelector('.p-title').value,
                description: item.querySelector('.p-desc').value,
                link: item.querySelector('.p-link').value,
                icon: item.querySelector('.p-icon').value,
                tech: item.querySelector('.p-tech').value.split(',').map(s => s.trim()).filter(s => s),
                image: item.querySelector('.p-image-data').value
            };
        });

        // Build ACHIEVEMENTS
        const achievements = Array.from(document.querySelectorAll('.achv-item')).map(item => {
            return {
                title: item.querySelector('.a-title').value,
                date: item.querySelector('.a-date').value,
                description: item.querySelector('.a-desc').value,
                image: item.querySelector('.a-image-data').value
            };
        });

        // Merge into full JSON keeping Hero & About completely untouched!
        const payload = {
            ...fullJsonData,
            skills: {
                languages: skillsLanguages,
                libraries: skillsLibraries,
                tools: skillsTools
            },
            projects: projects,
            achievements: achievements
        };

        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to Cloud...';
        saveBtn.disabled = true;

        try {
            if (window.supabase && !window.SUPABASE_CONFIG_PLACEHOLDER) {
                const res = await supabase.from('portfolio_settings').upsert({ id: 1, data: payload });
                if (res.error) throw res.error;
                toast.classList.remove('hidden');
                setTimeout(() => toast.classList.add('hidden'), 3000);
            } else {
                // Fallback to existing Flask endpoint if available
                const resp = await fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                let parsed;
                try { parsed = await resp.json(); } catch(_) { parsed = null; }
                if (!resp.ok) throw new Error(parsed?.error || 'Save failed. Configure Supabase or run Flask backend.');
                toast.classList.remove('hidden');
                setTimeout(() => toast.classList.add('hidden'), 3000);
            }
        } catch (err) {
            alert('Save failed: ' + (err.message || err));
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    });

    // --- TAB SWITCHING LOGIC ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

});
