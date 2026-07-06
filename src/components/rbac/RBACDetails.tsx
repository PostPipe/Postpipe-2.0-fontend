import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Shield, Database, ExternalLink, Code2, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateSnippets } from '@/lib/snippet-generator';
import { RBACEditModal } from './RBACEditModal';

export default function RBSCDetails({ system, forms }: { system: any, forms: any[] }) {
    const rolesForm = forms.find(f => f.id === system.settings?.rolesFormId);
    const permsForm = forms.find(f => f.id === system.settings?.permissionsFormId);
    const [activeTab, setActiveTab] = React.useState<'overview' | 'react' | 'html'>('overview');
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: 'Snippet copied to clipboard!' });
    };

    const reactSnippet = `
import React, { useState, useEffect } from 'react';

// Replace with your Postpipe Endpoint base URL
const POSTPIPE_URL = 'http://localhost:9002';
const CONNECTOR_URL = '${system.connectorUrl || 'http://localhost:3002'}';
const SYSTEM_ID = '${system.id}';
const ROLES_FORM_ID = '${system.settings?.rolesFormId || ''}';
const PERMS_FORM_ID = '${system.settings?.permissionsFormId || ''}';
const ROLES_READ_TOKEN = '${rolesForm?.readToken || ''}';
const PERMS_READ_TOKEN = '${permsForm?.readToken || ''}';

const USERS_API_URL = 'http://localhost:9002/api/users'; // REPLACE THIS WITH ACTUAL USERS API

export default function RBSCAdminPanel() {
  const getSafeToken = () => {
    try { return localStorage.getItem('pp_admin_token') || ''; } catch (e) { return ''; }
  };
  const [token, setToken] = useState(getSafeToken());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [roles, setRoles] = useState([]);
  const [managedForms, setManagedForms] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Assign Permissions State
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState('');
  const [selectedForms, setSelectedForms] = useState([]);

  // Assign Users State
  const [selectedUserForAssign, setSelectedUserForAssign] = useState('');
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState('');
  
  useEffect(() => {
    if (token) {
      fetchRoles();
      fetchManagedForms();
      fetchPermissions();
      fetchUsers();
    }
  }, [token]);

  useEffect(() => {
    if (selectedRoleForPerms) {
      const existingPerm = [...permissions].reverse().find(p => p.data?.role === selectedRoleForPerms);
      setSelectedForms(existingPerm?.data?.accessible_forms || []);
    } else {
      setSelectedForms([]);
    }
  }, [selectedRoleForPerms, permissions]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(\`\${CONNECTOR_URL}/api/auth/login\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        try { localStorage.setItem('pp_admin_token', data.token); } catch (e) {}
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error during login.');
    }
  };

  const fetchRoles = async () => {
    const res = await fetch(\`\${POSTPIPE_URL}/api/postpipe/forms/\${ROLES_FORM_ID}/submissions\`, {
      headers: { 'Authorization': \`Bearer \${ROLES_READ_TOKEN}\` }
    });
    if (res.ok) {
      const data = await res.json();
      setRoles(data.submissions || []);
    }
  };

  const fetchManagedForms = async () => {
    const res = await fetch(\`\${POSTPIPE_URL}/api/public/rbac/\${SYSTEM_ID}/forms\`);
    if (res.ok) {
      const data = await res.json();
      setManagedForms(data.forms || []);
    }
  };

  const fetchPermissions = async () => {
    const res = await fetch(\`\${POSTPIPE_URL}/api/postpipe/forms/\${PERMS_FORM_ID}/submissions\`, {
      headers: { 'Authorization': \`Bearer \${PERMS_READ_TOKEN}\` }
    });
    if (res.ok) {
      const data = await res.json();
      setPermissions(data.submissions || []);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(USERS_API_URL);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || data.data || []);
      }
    } catch(e) {
      console.warn("Failed to fetch users. Ensure USERS_API_URL is correct.");
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleForPerms) return;
    const payload = { role: selectedRoleForPerms, accessible_forms: selectedForms };
    const url = \`\${POSTPIPE_URL}/api/public/submit/\${PERMS_FORM_ID}\`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Permissions saved successfully!');
        fetchPermissions();
      } else {
        alert('Failed to save permissions');
      }
    } catch(e) {
      alert('Error saving permissions');
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserForAssign || !selectedRoleForAssign) {
      alert("Please select both a user and a role.");
      return;
    }
    // Replace this with actual users API assignment logic
    alert(\`Assigned User \${selectedUserForAssign} to Role \${selectedRoleForAssign}\`);
  };

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'system-ui' }}>
        <h2>Master Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '8px' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '8px' }} />
          <button type="submit" style={{ padding: '10px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '4px' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>RBAC Dashboard</h2>
        <button onClick={() => { setToken(''); try { localStorage.removeItem('pp_admin_token'); } catch (e) {} }} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1 1 300px', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px', background: '#fff' }}>
          <h3>Roles (Form: {ROLES_FORM_ID})</h3>
          <p>Total Roles: {roles.length}</p>
        </div>
        
        <div style={{ flex: '1 1 300px', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px', background: '#fff' }}>
          <h3>Assign Permissions</h3>
          <select 
            value={selectedRoleForPerms} 
            onChange={(e) => setSelectedRoleForPerms(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">-- Select a Role --</option>
            {roles.map(r => (
              <option key={r.submission_id} value={r.submission_id}>{r.data?.name || r.data?.text || r.submission_id}</option>
            ))}
          </select>

          {selectedRoleForPerms && (
            <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
              {managedForms.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#6b7280' }}>No managed forms assigned to this RBAC system.</p>
              ) : (
                <>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Accessible Forms:</p>
                  {managedForms.map(form => (
                    <label key={form.id} style={{ display: 'block', margin: '5px 0', fontSize: '14px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedForms.includes(form.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedForms([...selectedForms, form.id]);
                          else setSelectedForms(selectedForms.filter(id => id !== form.id));
                        }}
                      /> {form.name}
                    </label>
                  ))}
                  <button style={{ marginTop: '10px', padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleSavePermissions}>Save Permissions</button>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 300px', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px', background: '#fff' }}>
          <h3>Assign Users</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Select User:</label>
            <select 
              value={selectedUserForAssign} 
              onChange={(e) => setSelectedUserForAssign(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Select a User --</option>
              {users.map(u => (
                <option key={u.id || u._id} value={u.id || u._id}>{u.name || u.email || u.id}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Select Role:</label>
            <select 
              value={selectedRoleForAssign} 
              onChange={(e) => setSelectedRoleForAssign(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Select a Role --</option>
              {roles.map(r => (
                <option key={r.submission_id} value={r.submission_id}>{r.data?.name || r.data?.text || r.submission_id}</option>
              ))}
            </select>
          </div>
          <button style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleAssignUser}>Assign Role to User</button>
        </div>

      </div>
    </div>
  );
}
}
`.trim();

    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const rolesHtml = rolesForm ? generateSnippets(rolesForm.id, rolesForm.name, rolesForm.fields || [], appUrl, rolesForm.connectorUrl || '').html : '';
    const permsHtml = permsForm ? generateSnippets(permsForm.id, permsForm.name, permsForm.fields || [], appUrl, permsForm.connectorUrl || '').html : '';

    const htmlSnippet = `
<!DOCTYPE html>
<html>
<head>
    <title>RBAC Admin Panel</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 20px; background: #fafafa; }
        .login-box { max-width: 400px; margin: 40px auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .dashboard-container { max-width: 1000px; margin: 0 auto; display: none; }
        .forms-grid { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px; }
        .form-card { flex: 1 1 300px; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
        input[type="email"], input[type="password"], input[type="text"], button, select, textarea { display: block; width: 100%; margin-bottom: 10px; padding: 10px; box-sizing: border-box; border: 1px solid #e5e7eb; border-radius: 6px; }
        button { background: #7c3aed; color: white; border: none; cursor: pointer; font-weight: 500; }
        button:hover { background: #6d28d9; }
        label { display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500; color: #374151; }
        h3 { margin-top: 0; color: #111827; }
        .form-check { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; }
        .form-check input { margin: 0; width: auto; }
        .header { display: flex; justify-content: space-between; align-items: center; }
        .logout-btn { width: auto; padding: 8px 16px; background: #ef4444; }
        .logout-btn:hover { background: #dc2626; }
    </style>
</head>
<body>
    <div id="login-screen" class="login-box">
        <h2>Master Admin Login</h2>
        <input type="email" id="email" placeholder="Admin Email" />
        <input type="password" id="password" placeholder="Password" />
        <button onclick="login()">Login</button>
    </div>

    <div id="dashboard" class="dashboard-container">
        <div class="header">
            <h2>RBAC Admin Dashboard</h2>
            <button class="logout-btn" onclick="logout()">Logout</button>
        </div>
        <div class="forms-grid">
            <div class="form-card">
                <h3>Manage Roles</h3>
                ${rolesHtml.replace(/<!DOCTYPE html>|<html>|<head>[\s\S]*?<\/head>|<body>|<\/body>|<\/html>/g, '').trim()}
            </div>
            
            <div class="form-card">
                <h3>Assign Permissions</h3>
                <select id="role-select" onchange="renderPermissions()">
                    <option value="">-- Select a Role --</option>
                </select>
                <div id="permissions-container" style="margin-top: 15px;"></div>
            </div>

            <div class="form-card">
                <h3>Assign Users</h3>
                <label>Select User:</label>
                <select id="user-select">
                    <option value="">-- Select a User --</option>
                </select>
                
                <label style="margin-top: 10px;">Select Role:</label>
                <select id="assign-role-select">
                    <option value="">-- Select a Role --</option>
                </select>
                
                <button onclick="assignUser()" style="margin-top: 15px;">Assign Role to User</button>
            </div>
        </div>
    </div>

    <script>
        const POSTPIPE_URL = '${appUrl || 'http://localhost:9002'}';
        const CONNECTOR_URL = '${system.connectorUrl || 'http://localhost:3002'}';
        const SYSTEM_ID = '${system.id}';
        const ROLES_FORM_ID = '${rolesForm?.id || ''}';
        const PERMS_FORM_ID = '${permsForm?.id || ''}';
        const ROLES_READ_TOKEN = '${rolesForm?.readToken || ''}';
        const PERMS_READ_TOKEN = '${permsForm?.readToken || ''}';
        const USERS_API_URL = 'http://localhost:9002/api/users'; // REPLACE THIS WITH ACTUAL USERS API
        
        let roles = [];
        let managedForms = [];
        let permissions = [];
        let users = [];
        
        function getSafeToken() {
            try {
                return localStorage.getItem('pp_admin_token') || '';
            } catch (e) {
                return window._pp_mem_token || '';
            }
        }
        
        function setSafeToken(token) {
            try {
                localStorage.setItem('pp_admin_token', token);
            } catch (e) {
                window._pp_mem_token = token;
            }
        }
        
        function removeSafeToken() {
            try {
                localStorage.removeItem('pp_admin_token');
            } catch (e) {
                window._pp_mem_token = '';
            }
        }

        async function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch(CONNECTOR_URL + '/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok && data.token) {
                    setSafeToken(data.token);
                    initDashboard();
                } else {
                    alert('Login failed: ' + (data.error || 'Unknown error'));
                }
            } catch (e) {
                alert('Network error during login.');
            }
        }

        function logout() {
            removeSafeToken();
            document.getElementById('dashboard').style.display = 'none';
            document.getElementById('login-screen').style.display = 'block';
        }

        async function initDashboard() {
            const token = getSafeToken();
            if (!token) return;
            
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';

            try {
                await Promise.all([
                    fetch(POSTPIPE_URL + '/api/postpipe/forms/' + ROLES_FORM_ID + '/submissions', { headers: { 'Authorization': 'Bearer ' + ROLES_READ_TOKEN } })
                        .then(r => r.ok ? r.json() : Promise.reject('Failed to load roles'))
                        .then(d => roles = d.submissions || []),
                    fetch(POSTPIPE_URL + '/api/public/rbac/' + SYSTEM_ID + '/forms')
                        .then(r => r.ok ? r.json() : Promise.reject('Failed to load managed forms'))
                        .then(d => managedForms = d.forms || []),
                    fetch(POSTPIPE_URL + '/api/postpipe/forms/' + PERMS_FORM_ID + '/submissions', { headers: { 'Authorization': 'Bearer ' + PERMS_READ_TOKEN } })
                        .then(r => r.ok ? r.json() : Promise.reject('Failed to load permissions'))
                        .then(d => permissions = d.submissions || []),
                    fetch(USERS_API_URL)
                        .then(r => r.ok ? r.json() : Promise.resolve({ users: [] }))
                        .then(d => users = d.users || d.data || [])
                        .catch(e => console.warn("Failed to load users:", e))
                ]);

                populateDropdowns();
                renderPermissions();
            } catch (err) {
                console.error("Dashboard initialization error:", err);
                document.getElementById('permissions-container').innerHTML = 
                    '<p style="color: #ef4444; font-size: 14px;">Failed to load data. See console for details. Error: ' + err + '</p>';
            }
        }

        function populateDropdowns() {
            const roleSelect = document.getElementById('role-select');
            const assignRoleSelect = document.getElementById('assign-role-select');
            const userSelect = document.getElementById('user-select');

            // Populate Roles
            let roleOptions = '<option value="">-- Select a Role --</option>';
            roles.forEach(r => {
                roleOptions += \`<option value="\${r.submission_id}">\${r.data?.name || r.data?.text || r.submission_id}</option>\`;
            });
            roleSelect.innerHTML = roleOptions;
            assignRoleSelect.innerHTML = roleOptions;

            // Populate Users
            let userOptions = '<option value="">-- Select a User --</option>';
            users.forEach(u => {
                userOptions += \`<option value="\${u.id || u._id}">\${u.name || u.email || u.id}</option>\`;
            });
            userSelect.innerHTML = userOptions;
        }

        function renderPermissions() {
            const container = document.getElementById('permissions-container');
            const roleId = document.getElementById('role-select').value;
            
            container.innerHTML = '';
            
            if (!roleId) {
                return; // Nothing selected
            }

            if (managedForms.length === 0) {
                container.innerHTML = '<p style="color: #6b7280; font-size: 12px;">No managed forms assigned to this RBAC system.</p>';
                return;
            }

            // Find existing permission record for this role
            const existingPerm = [...permissions].reverse().find(p => p.data?.role === roleId);
            const accessibleForms = existingPerm?.data?.accessible_forms || [];

            let html = '<div style="padding: 10px; background: #f9f9f9; border-radius: 4px;">';
            html += '<p style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Accessible Forms:</p>';
            
            managedForms.forEach(form => {
                const isChecked = accessibleForms.includes(form.id) ? 'checked' : '';
                html += \`
                    <label class="form-check">
                        <input type="checkbox" id="perm-\${form.id}" value="\${form.id}" \${isChecked} />
                        \${form.name}
                    </label>
                \`;
            });
            
            html += \`<button onclick="savePermissions('\${roleId}')" style="margin-top: 10px;">Save Permissions</button>\`;
            html += '</div>';
            
            container.innerHTML = html;
        }

        async function savePermissions(roleId) {
            const checkboxes = document.querySelectorAll('input[id^="perm-"]');
            const selectedForms = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            
            const payload = {
                role: roleId,
                accessible_forms: selectedForms
            };

            const url = POSTPIPE_URL + '/api/public/submit/' + PERMS_FORM_ID;
            
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert('Permissions saved successfully!');
                    initDashboard(); // refresh state
                } else {
                    alert('Failed to save permissions');
                }
            } catch(e) {
                alert('Error saving permissions');
            }
        }

        async function assignUser() {
            const userId = document.getElementById('user-select').value;
            const roleId = document.getElementById('assign-role-select').value;
            
            if (!userId || !roleId) {
                alert("Please select both a user and a role.");
                return;
            }
            
            // Replace this with actual users API assignment logic
            alert(\`Assigned User \${userId} to Role \${roleId}\`);
        }

        // Auto-login if token exists
        if (getSafeToken()) {
            initDashboard();
        }
    </script>
</body>
</html>
`.trim();

    return (
        <div className='p-6 bg-indigo-50/30 dark:bg-indigo-950/5 border-t border-neutral-200/60 dark:border-white/[0.04]'>
            <div className='flex justify-between items-center mb-6 border-b border-neutral-200 dark:border-white/10 pb-4'>
                <div className='flex gap-4'>
                    <Button variant={activeTab === 'overview' ? 'default' : 'ghost'} size='sm' onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'bg-violet-600 hover:bg-violet-500' : ''}>Overview</Button>
                    <Button variant={activeTab === 'react' ? 'default' : 'ghost'} size='sm' onClick={() => setActiveTab('react')} className={activeTab === 'react' ? 'bg-violet-600 hover:bg-violet-500 text-white' : ''}><Code2 className='w-4 h-4 mr-2'/> React Snippet</Button>
                    <Button variant={activeTab === 'html' ? 'default' : 'ghost'} size='sm' onClick={() => setActiveTab('html')} className={activeTab === 'html' ? 'bg-violet-600 hover:bg-violet-500 text-white' : ''}><Code2 className='w-4 h-4 mr-2'/> HTML Snippet</Button>
                </div>
                <Button variant='outline' size='sm' onClick={() => setIsEditModalOpen(true)}><Settings className='w-4 h-4 mr-2' /> Edit Settings</Button>
            </div>

            {activeTab === 'overview' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-4'>
                        <h4 className='text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2'><Database className='w-4 h-4 text-violet-500'/> Attached Forms</h4>
                        <div className='p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02]'>
                            <div className='flex justify-between items-center mb-2'>
                                <span className='text-sm font-medium text-neutral-800 dark:text-neutral-200'>Roles Form</span>
                                <span className='text-xs font-mono text-neutral-500'>{rolesForm?.id}</span>
                            </div>
                            <p className='text-xs text-neutral-500 mb-3'>Manages available roles.</p>
                            <a href={`/dashboard/forms/${rolesForm?.id}/submissions`} target='_blank' rel='noreferrer'>
                                <Button size='sm' variant='outline' className='w-full text-xs h-8'>View Submissions <ExternalLink className='w-3 h-3 ml-2'/></Button>
                            </a>
                        </div>
                        <div className='p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02]'>
                            <div className='flex justify-between items-center mb-2'>
                                <span className='text-sm font-medium text-neutral-800 dark:text-neutral-200'>Permissions Form</span>
                                <span className='text-xs font-mono text-neutral-500'>{permsForm?.id}</span>
                            </div>
                            <p className='text-xs text-neutral-500 mb-3'>Maps roles to resources and actions.</p>
                            <a href={`/dashboard/forms/${permsForm?.id}/submissions`} target='_blank' rel='noreferrer'>
                                <Button size='sm' variant='outline' className='w-full text-xs h-8'>View Submissions <ExternalLink className='w-3 h-3 ml-2'/></Button>
                            </a>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <h4 className='text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2'><Shield className='w-4 h-4 text-violet-500'/> Endpoints</h4>
                        <div className='p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02] space-y-5'>
                            <div>
                                <span className='text-xs font-semibold text-neutral-500 block mb-1'>Bearer Token (Master Admin)</span>
                                <div className='flex items-center gap-2'>
                                    <code className='text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded flex-1 truncate border border-neutral-200 dark:border-white/10'>
                                        {rolesForm?.readToken}
                                    </code>
                                    <Button size='icon' variant='ghost' className='h-8 w-8 shrink-0' onClick={() => copyCode(rolesForm?.readToken || '')}><Copy className='w-4 h-4'/></Button>
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <span className='text-xs font-semibold text-neutral-500 block mb-1'>Roles API</span>
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] font-bold text-blue-500 w-10'>GET</span>
                                    <code className='text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded flex-1 truncate border border-neutral-200 dark:border-white/10'>
                                        /api/postpipe/forms/{rolesForm?.id}/submissions
                                    </code>
                                    <Button size='icon' variant='ghost' className='h-8 w-8 shrink-0' onClick={() => copyCode(`/api/postpipe/forms/${rolesForm?.id}/submissions`)}><Copy className='w-4 h-4'/></Button>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] font-bold text-green-500 w-10'>POST</span>
                                    <code className='text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded flex-1 truncate border border-neutral-200 dark:border-white/10'>
                                        /api/public/submit/{rolesForm?.id}
                                    </code>
                                    <Button size='icon' variant='ghost' className='h-8 w-8 shrink-0' onClick={() => copyCode(`/api/public/submit/${rolesForm?.id}`)}><Copy className='w-4 h-4'/></Button>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] font-bold text-orange-500 w-10'>PUT</span>
                                    <code className='text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded flex-1 truncate border border-neutral-200 dark:border-white/10'>
                                        /api/postpipe/forms/{rolesForm?.id}/submissions/{'{id}'}
                                    </code>
                                    <Button size='icon' variant='ghost' className='h-8 w-8 shrink-0' onClick={() => copyCode(`/api/postpipe/forms/${rolesForm?.id}/submissions/{id}`)}><Copy className='w-4 h-4'/></Button>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] font-bold text-red-500 w-10'>DELETE</span>
                                    <code className='text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded flex-1 truncate border border-neutral-200 dark:border-white/10'>
                                        /api/postpipe/forms/{rolesForm?.id}/submissions/{'{id}'}
                                    </code>
                                    <Button size='icon' variant='ghost' className='h-8 w-8 shrink-0' onClick={() => copyCode(`/api/postpipe/forms/${rolesForm?.id}/submissions/{id}`)}><Copy className='w-4 h-4'/></Button>
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <span className='text-xs font-semibold text-neutral-500 block mb-1'>Permissions API</span>
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] font-bold text-blue-500 w-10'>GET</span>
                                    <code className='text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded flex-1 truncate border border-neutral-200 dark:border-white/10'>
                                        /api/postpipe/forms/{permsForm?.id}/submissions
                                    </code>
                                    <Button size='icon' variant='ghost' className='h-8 w-8 shrink-0' onClick={() => copyCode(`/api/postpipe/forms/${permsForm?.id}/submissions`)}><Copy className='w-4 h-4'/></Button>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] font-bold text-green-500 w-10'>POST</span>
                                    <code className='text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded flex-1 truncate border border-neutral-200 dark:border-white/10'>
                                        /api/public/submit/{permsForm?.id}
                                    </code>
                                    <Button size='icon' variant='ghost' className='h-8 w-8 shrink-0' onClick={() => copyCode(`/api/public/submit/${permsForm?.id}`)}><Copy className='w-4 h-4'/></Button>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] font-bold text-orange-500 w-10'>PUT</span>
                                    <code className='text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded flex-1 truncate border border-neutral-200 dark:border-white/10'>
                                        /api/postpipe/forms/{permsForm?.id}/submissions/{'{id}'}
                                    </code>
                                    <Button size='icon' variant='ghost' className='h-8 w-8 shrink-0' onClick={() => copyCode(`/api/postpipe/forms/${permsForm?.id}/submissions/{id}`)}><Copy className='w-4 h-4'/></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'react' && (
                <div className='relative'>
                    <Button size='icon' variant='secondary' className='absolute top-2 right-2 h-8 w-8' onClick={() => copyCode(reactSnippet)}><Copy className='w-4 h-4'/></Button>
                    <pre className='p-4 rounded-xl bg-[#0d1117] text-white text-xs overflow-x-auto border border-white/10'>
                        <code>{reactSnippet}</code>
                    </pre>
                </div>
            )}

            {activeTab === 'html' && (
                <div className='relative'>
                    <div className='absolute top-4 right-4 flex gap-2'>
                        <Button size='sm' variant='secondary' onClick={() => copyCode(htmlSnippet)}><Copy className='w-4 h-4 mr-2'/> Copy Snippet</Button>
                    </div>
                    <pre className='p-4 rounded-xl bg-neutral-900 text-neutral-100 overflow-x-auto text-sm font-mono border border-neutral-800 shadow-inner'>
                        <code>{htmlSnippet}</code>
                    </pre>
                </div>
            )}

            <RBACEditModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                system={system} 
                forms={forms} 
            />
        </div>
    );
}
