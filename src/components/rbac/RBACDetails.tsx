import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Shield, Database, ExternalLink, Code2, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateSnippets } from '@/lib/snippet-generator';
import { RBACEditModal } from './RBACEditModal';

export default function RBSCDetails({ system, forms }: { system: any, forms: any[] }) {
    const rolesForm = forms.find(f => f.id === system.settings?.rolesFormId);
    const permsForm = forms.find(f => f.id === system.settings?.permissionsFormId);
    const [activeTab, setActiveTab] = React.useState<'overview' | 'react' | 'html' | 'portal'>('overview');
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
    const res = await fetch(\`\${POSTPIPE_URL}/api/public/references/\${ROLES_FORM_ID}\`);
    if (res.ok) {
      const data = await res.json();
      setRoles(data.data || data.submissions || []);
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
    const res = await fetch(\`\${POSTPIPE_URL}/api/public/references/\${PERMS_FORM_ID}\`);
    if (res.ok) {
      const data = await res.json();
      setPermissions(data.data || data.submissions || []);
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

    const formSchemasMap = forms.reduce((acc, form) => {
        acc[form.id] = form.fields || [];
        return acc;
    }, {} as any);

    const managedFormsList = forms.filter(f => f.id !== system.settings?.rolesFormId && f.id !== system.settings?.permissionsFormId);
    let portalFormsHtml = '';
    let portalScripts = '';

    managedFormsList.forEach(f => {
        const snippet = generateSnippets(f.id, f.name, f.fields || [], appUrl, f.connectorUrl || '');
        // Extract body content and remove the html/body wrappers
        let formContent = snippet.html.replace(/<!DOCTYPE html>|<html>|<head>[\\s\\S]*?<\/head>|<body>|<\/body>|<\/html>/g, '').trim();
        // Remove the script tag so we can put it at the bottom
        const scriptMatch = formContent.match(/<script>[\\s\\S]*?<\/script>/g);
        if (scriptMatch) {
            scriptMatch.forEach(s => { portalScripts += s + '\\n'; });
            formContent = formContent.replace(/<script>[\\s\\S]*?<\/script>/g, '');
        }

        portalFormsHtml += `
            <div class="form-card" style="margin-bottom: 30px; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; background: white;">
                \${formContent}
            </div>
        `;
    });

    const portalHtmlSnippet = `<!DOCTYPE html>
<html>
<head>
    <title>User Portal</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: #fafafa; }
        .form-card h2 { margin-top: 0; color: #111827; font-size: 1.25rem; margin-bottom: 1rem; }
        .field-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .field-group label { font-size: 0.875rem; font-weight: 500; color: #374151; text-transform: capitalize; }
        input, select, textarea { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
        button { background-color: #8b5cf6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; font-weight: 500; cursor: pointer; }
        button:hover { background-color: #7c3aed; }
        .dynamic-kv-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
        .remove-kv-btn { background-color: #ef4444; width: 40px; }
    </style>
</head>
<body>
    <div style="margin-bottom: 30px;">
        <h1 style="color: #111827; margin-bottom: 8px;">User Portal</h1>
        <p style="color: #6b7280; margin-top: 0;">Submit data for available forms below.</p>
    </div>
    \${portalFormsHtml}
    \${portalScripts}
</body>
</html>`.trim();


    const htmlSnippet = `\n<!DOCTYPE html>
<html>

<head>
    <title>RBAC Admin Panel</title>
    <style>
        body {
            font-family: system-ui, sans-serif;
            padding: 20px;
            background: #fafafa;
        }

        .login-box {
            max-width: 400px;
            margin: 40px auto;
            border: 1px solid #e5e7eb;
            padding: 20px;
            border-radius: 8px;
            background: white;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .dashboard-container {
            max-width: 1000px;
            margin: 0 auto;
            display: none;
        }

        .forms-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 20px;
        }

        .form-card {
            flex: 1 1 300px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        input[type="email"],
        input[type="password"],
        input[type="text"],
        button,
        select,
        textarea {
            display: block;
            width: 100%;
            margin-bottom: 10px;
            padding: 10px;
            box-sizing: border-box;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
        }

        button {
            background: #7c3aed;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 500;
        }

        button:hover {
            background: #6d28d9;
        }

        label {
            display: block;
            margin-bottom: 4px;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
        }

        h3 {
            margin-top: 0;
            color: #111827;
        }

        .form-check {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .form-check input {
            margin: 0;
            width: auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logout-btn {
            width: auto;
            padding: 8px 16px;
            background: #ef4444;
        }

        .logout-btn:hover {
            background: #dc2626;
        }

        /* Data Management Styles */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 14px;
        }

        th,
        td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        th {
            background: #f9fafb;
            font-weight: 600;
        }

        .action-btn {
            padding: 4px 8px;
            font-size: 12px;
            margin-right: 4px;
            width: auto;
            display: inline-block;
        }

        .btn-edit {
            background: #3b82f6;
        }

        .btn-edit:hover {
            background: #2563eb;
        }

        .btn-delete {
            background: #ef4444;
        }

        .btn-delete:hover {
            background: #dc2626;
        }

        /* Modal Styles */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 500px;
            max-width: 90%;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .modal-header h3 {
            margin: 0;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: auto;
        }

        .modal-close:hover {
            background: none;
            color: #111827;
        }

        .form-list-item {
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            cursor: pointer;
            background: white;
            transition: background 0.2s;
            font-size: 14px;
            font-weight: 500;
        }

        .form-list-item:hover {
            background: #f3f4f6;
        }

        .form-list-item.active {
            background: #ede9fe;
            border-color: #8b5cf6;
            color: #5b21b6;
        }
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
                ${rolesHtml.replace(/<!DOCTYPE html>|<html>|<head>[\\s\\S]*?<\/head>|<body>|<\/body>|<\/html>/g, '').trim()}
            </div>
            <div class="form-card">
                <h3>Assign Permissions</h3>
                <div class="field-group">
                    <label>Select Role:</label>
                    <select id="role-select" onchange="renderPermissions()">
                        <option value="">-- Select a Role --</option>
                    </select>
                </div>
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

            <div class="form-card" style="flex: 1 1 100%;">
                <h3>Data Management</h3>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">Manage data for forms assigned to your
                    role (Master Admin sees all Managed Forms).</p>
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1; border-right: 1px solid #e5e7eb; padding-right: 20px; max-width: 250px;">
                        <h4 style="margin-top: 0;">Accessible Forms</h4>
                        <div id="data-forms-list" style="display: flex; flex-direction: column; gap: 8px;">
                            <p style="font-size: 12px; color: #9ca3af;">Loading forms...</p>
                        </div>
                    </div>
                    <div style="flex: 2; overflow-x: auto;">
                        <div
                            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h4 id="selected-form-title" style="margin: 0;">Select a form</h4>
                            <button id="btn-create-entry"
                                style="width: auto; padding: 6px 12px; font-size: 12px; display: none;"
                                onclick="openCreateModal()">Create New Entry</button>
                        </div>
                        <div id="submissions-container">
                            <p style="font-size: 12px; color: #9ca3af;">Select a form from the left to view its data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- CRUD Modal -->
    <div id="crud-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Create Entry</h3>
                <button class="modal-close" onclick="closeCrudModal()">&times;</button>
            </div>
            <form id="crud-dynamic-form" onsubmit="saveCrudEntry(event)">
                <div id="crud-fields-container" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; max-height: 60vh; overflow-y: auto;"></div>
                <input type="hidden" id="crud-submission-id" />
                <button type="submit" id="btn-save-crud" style="margin-top: 10px;">Save Entry</button>
            </form>
        </div>
    </div>

    <script>
        const POSTPIPE_URL = '${appUrl || 'http://localhost:9002'}';
        const CONNECTOR_URL = '${system.connectorUrl || 'http://localhost:3002'}';
        const SYSTEM_ID = '${system.id}';
        const ROLES_FORM_ID = '${rolesForm?.id || ''}';
        const PERMS_FORM_ID = '${permsForm?.id || ''}';
        
        const USERS_API_URL = '${appUrl || 'http://localhost:9002'}/api/public/references/users';
        
        const ROLES_READ_TOKEN = '${rolesForm?.readToken || ''}';
        const PERMS_READ_TOKEN = '${permsForm?.readToken || ''}';

        let roles = [];
        let managedForms = [];
        let permissions = [];
        let users = [];
        
        // This object should be populated with the schema of each form
        // For the generated snippet, it will be injected dynamically.
        // For testing here, you can add fields for the forms you test.
        const formSchemas = ${JSON.stringify(formSchemasMap)};

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


            const results = await Promise.allSettled([
                // Roles - public references API
                fetch(POSTPIPE_URL + '/api/public/references/' + ROLES_FORM_ID)
                    .then(r => { console.log('[ROLES] status:', r.status); return r.ok ? r.json() : r.text().then(t => { throw new Error('Roles: ' + r.status + ' ' + t) }); })
                    .then(d => { roles = d.data || d.submissions || []; console.log('[ROLES] loaded:', roles.length); }),
                // Managed Forms
                fetch(POSTPIPE_URL + '/api/public/rbac/' + SYSTEM_ID + '/forms')
                    .then(r => { console.log('[FORMS] status:', r.status); return r.ok ? r.json() : r.text().then(t => { throw new Error('Forms: ' + r.status + ' ' + t) }); })
                    .then(d => { 
                        managedForms = d.forms || []; 
                        managedForms.forEach(f => {
                            if (f.fields && f.fields.length > 0) {
                                formSchemas[f.id] = f.fields;
                            }
                        });
                        console.log('[FORMS] loaded:', managedForms.length); 
                    }),
                // Permissions - public references API
                fetch(POSTPIPE_URL + '/api/public/references/' + PERMS_FORM_ID)
                    .then(r => { console.log('[PERMS] status:', r.status); return r.ok ? r.json() : r.text().then(t => { throw new Error('Perms: ' + r.status + ' ' + t) }); })
                    .then(d => { permissions = d.data || d.submissions || []; console.log('[PERMS] loaded:', permissions.length); }),
                // Users
                fetch(USERS_API_URL, { headers: { 'Authorization': 'Bearer ' + ROLES_READ_TOKEN } })
                    .then(r => { console.log('[USERS] status:', r.status); return r.ok ? r.json() : r.text().then(t => { throw new Error('Users: ' + r.status + ' ' + t) }); })
                    .then(d => {
                        console.log('[USERS] raw response:', d);
                        const rawUsers = d.data || d.users || [];
                        users = rawUsers.map(u => ({
                            id: u.submissionId || u.id || u._id,
                            ...u.data,
                            ...u
                        }));
                        console.log('[USERS] loaded:', users.length, users);
                    })
            ]);

            results.forEach((r, i) => {
                if (r.status === 'rejected') console.error('[initDashboard] fetch #' + i + ' failed:', r.reason);
            });

            populateDropdowns();
            renderPermissions();
            renderDataFormsList();
        }


        function populateDropdowns() {
            const roleSelect = document.getElementById('role-select');
            const assignRoleSelect = document.getElementById('assign-role-select');
            const userSelect = document.getElementById('user-select');
            const permFormRoleSelect = document.getElementById('perm-form-role-select');

            // Populate Roles (data comes from v1 API: each item has .submissionId and .data.name)
            let roleOptions = '<option value="">-- Select a Role --</option>';
            roles.forEach(r => {
                const id = r.submissionId || r.submission_id || r.id;
                const name = r.data?.name || r.data?.text || id;
                roleOptions += \`<option value="\${id}">\${name}</option>\`;
            });
            roleSelect.innerHTML = roleOptions;
            assignRoleSelect.innerHTML = roleOptions;

            // Populate Users
            let userOptions = '<option value="">-- Select a User --</option>';
            users.forEach(u => {
                const submissionId = u.submissionId || u.id || u._id;
                const displayName = u.name || u.email || submissionId;
                userOptions += \`<option value="\${submissionId}">\${displayName}</option>\`;
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

            // Find existing permission record for this role (reversed to get latest submission)
            // permissions from v1 API: each item has .submissionId and .data.role / .data.accessible_forms
            const existingPerm = [...permissions].reverse().find(p => p.data?.role === roleId);
            // accessible_forms may be stored as a comma-separated string OR an array
            let accessibleForms = existingPerm?.data?.accessible_forms || [];
            if (typeof accessibleForms === 'string') {
                accessibleForms = accessibleForms.split(',').map(s => s.trim()).filter(Boolean);
            }

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

            const existingPerm = [...permissions].reverse().find(p => p.data?.role === roleId);

            let url, method, reqBody;

            if (existingPerm) {
                const subId = existingPerm.submissionId || existingPerm.id || existingPerm._id;
                url = \`\${POSTPIPE_URL}/api/postpipe/forms/\${PERMS_FORM_ID}/submissions/\${subId}\`;
                method = 'PATCH';
                reqBody = JSON.stringify({ data: payload });
            } else {
                url = POSTPIPE_URL + '/api/public/submit/' + PERMS_FORM_ID;
                method = 'POST';
                reqBody = JSON.stringify(payload);
            }

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json', ...(method === 'PATCH' ? { 'Authorization': 'Bearer ' + getSafeToken() } : {}) },
                    body: reqBody
                });
                if (res.ok) {
                    alert('Permissions saved successfully!');
                    initDashboard(); // refresh state
                } else {
                    alert('Failed to save permissions');
                }
            } catch (e) {
                alert('Error saving permissions: ' + e.message);
            }
        }

        async function assignUser() {
            const userId = document.getElementById('user-select').value;
            const roleId = document.getElementById('assign-role-select').value;

            if (!userId || !roleId) {
                alert("Please select both a user and a role.");
                return;
            }

            const btn = document.querySelector('button[onclick="assignUser()"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Assigning...';

            try {
                const res = await fetch(POSTPIPE_URL + '/api/public/references/users', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        submissionId: userId,
                        patch: { roles: roleId }
                    })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    alert('Role assigned successfully!');
                    initDashboard(); // refresh dropdowns
                } else {
                    alert('Failed to assign role: ' + (data.error || res.statusText));
                }
            } catch (e) {
                alert('Network error assigning role: ' + e.message);
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }

        // Intercept Permissions Form submission
        document.getElementById('pp-form-permissions-4')?.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Saving...';

            const formData = new FormData(this);
            const payload = {};
            formData.forEach((value, key) => { payload[key] = value; });

            try {
                const res = await fetch(this.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert('Permissions saved successfully!');
                    this.reset();
                    initDashboard(); // refresh so new permission appears in dropdown
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert('Failed to save permissions: ' + (data.error || res.statusText));
                }
            } catch (e) {
                alert('Network error during submission.');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });

        // Intercept Roles Form submission to handle dynamically via Fetch and refresh dashboard
        document.getElementById('pp-form-roles-4')?.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Submitting...';

            const formData = new FormData(this);
            const payload = {};
            formData.forEach((value, key) => {
                payload[key] = value;
            });

            try {
                const res = await fetch(this.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert('Role created successfully!');
                    this.reset();
                    initDashboard(); // refresh state to show new role in list
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert('Failed to create role: ' + (data.error || res.statusText));
                }
            } catch (e) {
                alert('Network error during submission.');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });

        // ==========================================
        // Data Management CRUD Logic
        // ==========================================
        let currentSelectedFormId = null;
        let currentSubmissions = [];

        function renderDataFormsList() {
            const listContainer = document.getElementById('data-forms-list');
            listContainer.innerHTML = '';

            if (managedForms.length === 0) {
                listContainer.innerHTML = '<p style="font-size: 12px; color: #9ca3af;">No forms accessible.</p>';
                return;
            }

            managedForms.forEach(form => {
                const div = document.createElement('div');
                div.className = 'form-list-item';
                div.id = \`nav-form-\${form.id}\`;
                div.textContent = form.name;
                div.onclick = () => selectDataForm(form.id, form.name);
                listContainer.appendChild(div);
            });
        }

        async function selectDataForm(formId, formName) {
            currentSelectedFormId = formId;
            document.getElementById('selected-form-title').textContent = formName + ' Data';
            document.getElementById('btn-create-entry').style.display = 'block';

            // Highlight active item
            document.querySelectorAll('.form-list-item').forEach(el => el.classList.remove('active'));
            document.getElementById(\`nav-form-\${formId}\`).classList.add('active');

            const container = document.getElementById('submissions-container');
            container.innerHTML = '<p style="font-size: 12px; color: #9ca3af;">Loading data...</p>';

            try {
                // Fetch submissions for this form
                // In a real app we might construct the API url based on connector/db/form.
                // For this example, we assume we can proxy through public/references or direct to API if known.
                const url = \`\${POSTPIPE_URL}/api/public/references/\${formId}\`;
                const res = await fetch(url);

                if (!res.ok) throw new Error('Failed to fetch data');

                const data = await res.json();
                currentSubmissions = data.data || data.submissions || [];
                renderSubmissionsTable();
            } catch (e) {
                container.innerHTML = \`<p style="font-size: 12px; color: #ef4444;">Error loading data: \${e.message}</p>\`;
            }
        }

        function renderSubmissionsTable() {
            const container = document.getElementById('submissions-container');
            if (currentSubmissions.length === 0) {
                container.innerHTML = '<p style="font-size: 12px; color: #9ca3af;">No entries found for this form.</p>';
                return;
            }

            let html = '<table><thead><tr>';
            html += '<th>ID</th>';
            html += '<th>Data Summary</th>';
            html += '<th style="text-align: right;">Actions</th>';
            html += '</tr></thead><tbody>';

            currentSubmissions.forEach(sub => {
                const subId = sub.submissionId || sub.id || sub._id;
                
                let summaryObj = { ...(sub.data || {}) };
                if (summaryObj.role) {
                    const r = roles.find(r => (r.submissionId || r.id || r._id) === summaryObj.role);
                    if (r) summaryObj.role = r.data?.name || r.data?.text || summaryObj.role;
                }
                if (summaryObj.roles && Array.isArray(summaryObj.roles)) {
                    summaryObj.roles = summaryObj.roles.map(rId => {
                        const r = roles.find(r => (r.submissionId || r.id || r._id) === rId);
                        return r ? (r.data?.name || r.data?.text || rId) : rId;
                    });
                }
                
                let dataStr = '';
                const parts = [];
                Object.entries(summaryObj).forEach(([k, v]) => {
                    if (typeof v === 'object' && v !== null) {
                        parts.push(\`\${k}: \${Array.isArray(v) ? '[' + v.join(', ') + ']' : '{...}'}\`);
                    } else {
                        parts.push(\`\${k}: \${v}\`);
                    }
                });
                dataStr = parts.join(' | ');
                if (dataStr.length > 60) dataStr = dataStr.substring(0, 60) + '...';
                if (!dataStr) dataStr = 'Empty Data';

                html += \`<tr>
                    <td style="font-family: monospace; font-size: 12px;">\${subId.substring(0, 8)}...</td>
                    <td style="font-size: 12px;">\${dataStr}</td>
                    <td style="text-align: right;">
                        <button class="action-btn btn-edit" onclick="openEditModal('\${subId}')">Edit</button>
                        <button class="action-btn btn-delete" onclick="deleteSubmission('\${subId}')">Delete</button>
                    </td>
                </tr>\`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
        }

        function buildDynamicForm(formId, data) {
            const container = document.getElementById('crud-fields-container');
            container.innerHTML = '';
            
            const fields = formSchemas[formId] || [];
            if (fields.length === 0) {
                // Deduce schema from existing submissions
                const deducedKeys = new Set();
                currentSubmissions.forEach(sub => {
                    if (sub.data) {
                        Object.keys(sub.data).forEach(k => deducedKeys.add(k));
                    }
                });
                if (data && typeof data === 'object') {
                    Object.keys(data).forEach(k => deducedKeys.add(k));
                }

                container.innerHTML = \`
                    <div class="field-group">
                        <label style="margin-bottom: 8px;">Data Fields \${deducedKeys.size > 0 ? '(Auto-detected)' : '(No Schema Found)'}</label>
                        <div id="dynamic-kv-container" style="display: flex; flex-direction: column; gap: 8px;"></div>
                    </div>
                \`;
                
                const kvContainer = document.getElementById('dynamic-kv-container');
                window.addDynamicKVField = (key = '', value = '') => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.gap = '8px';
                    row.style.alignItems = 'center';
                    
                    const keyInput = document.createElement('input');
                    keyInput.type = 'text';
                    keyInput.value = key;
                    keyInput.className = 'dynamic-kv-key';
                    keyInput.style.flex = '1';
                    keyInput.style.marginBottom = '0';
                    keyInput.style.padding = '8px';
                    keyInput.style.background = '#f3f4f6';
                    keyInput.readOnly = true;
                    
                    const valInput = document.createElement('input');
                    valInput.type = 'text';
                    valInput.placeholder = 'Value';
                    valInput.value = typeof value === 'object' ? JSON.stringify(value) : value;
                    valInput.className = 'dynamic-kv-val';
                    valInput.style.flex = '2';
                    valInput.style.marginBottom = '0';
                    valInput.style.padding = '8px';
                    
                    row.appendChild(keyInput);
                    row.appendChild(valInput);
                    kvContainer.appendChild(row);
                };
                
                if (deducedKeys.size > 0) {
                    deducedKeys.forEach(k => {
                        window.addDynamicKVField(k, data ? data[k] : '');
                    });
                } else {
                    kvContainer.innerHTML = '<p style="font-size: 12px; color: #6b7280;">No schema defined for this form.</p>';
                }
                return;
            }
            
            let html = '';
            fields.forEach(f => {
                const safeLabel = f.name || f.label || f.type || 'field';
                let val = data[safeLabel] !== undefined ? data[safeLabel] : '';
                const req = f.required ? 'required' : '';
                
                // Specific UI for Role assignments
                if (safeLabel === 'role' || safeLabel === 'roles') {
                    const isMultiple = safeLabel === 'roles' || f.type === 'array' || f.type === 'list';
                    if (isMultiple) {
                        let selectedIds = [];
                        if (Array.isArray(val)) selectedIds = val;
                        else if (typeof val === 'string' && val) selectedIds = val.split(',').map(s => s.trim());
                        
                        let rolesHtml = '<div style="max-height: 150px; overflow-y: auto; border: 1px solid #e5e7eb; padding: 8px; border-radius: 4px; background: #fff;">';
                        roles.forEach(r => {
                            const rId = r.submissionId || r.id || r._id;
                            const rName = r.data?.name || r.data?.text || rId;
                            const checked = selectedIds.includes(rId) ? 'checked' : '';
                            rolesHtml += \`
                                <label class="form-check" style="margin-bottom: 4px;">
                                    <input type="checkbox" name="\${safeLabel}[]" value="\${rId}" \${checked} /> \${rName}
                                </label>
                            \`;
                        });
                        rolesHtml += '</div>';
                        html += \`
                            <div class="field-group" style="margin-bottom: 0;">
                                <label>\${safeLabel} \${f.required ? '*' : ''}</label>
                                \${rolesHtml}
                            </div>
                        \`;
                    } else {
                        const selectedId = val || '';
                        let optsHtml = '<option value="">Select a role...</option>';
                        roles.forEach(r => {
                            const rId = r.submissionId || r.id || r._id;
                            const rName = r.data?.name || r.data?.text || rId;
                            const sel = (selectedId === rId) ? 'selected' : '';
                            optsHtml += \`<option value="\${rId}" \${sel}>\${rName}</option>\`;
                        });
                        html += \`
                            <div class="field-group" style="margin-bottom: 0;">
                                <label>\${safeLabel} \${f.required ? '*' : ''}</label>
                                <select name="\${safeLabel}" \${req} style="width: 100%;">\${optsHtml}</select>
                            </div>
                        \`;
                    }
                    return; // Skip default rendering for this field
                }
                
                let inputType = 'text';
                if (f.type === 'number' || f.type === 'decimal') inputType = 'number';
                if (f.type === 'email') inputType = 'email';
                
                if (f.type === 'boolean') {
                    const checked = val ? 'checked' : '';
                    html += \`
                        <div class="field-group form-check" style="margin-bottom: 0;">
                            <input type="checkbox" name="\${safeLabel}" id="field-\${safeLabel}" \${checked}>
                            <label for="field-\${safeLabel}" style="display:inline; margin-bottom:0;">\${safeLabel} \${f.required ? '*' : ''}</label>
                        </div>
                    \`;
                } else if (f.type === 'enum' || f.type === 'select') {
                    const options = String(f.options || '').split(',').map(o => o.trim()).filter(Boolean);
                    let optsHtml = \`<option value="">Select...</option>\`;
                    options.forEach(o => {
                        const sel = (String(val) === o) ? 'selected' : '';
                        optsHtml += \`<option value="\${o}" \${sel}>\${o}</option>\`;
                    });
                    html += \`
                        <div class="field-group" style="margin-bottom: 0;">
                            <label>\${safeLabel} \${f.required ? '*' : ''}</label>
                            <select name="\${safeLabel}" \${req} style="width: 100%;">\${optsHtml}</select>
                        </div>
                    \`;
                } else {
                    html += \`
                        <div class="field-group" style="margin-bottom: 0;">
                            <label>\${safeLabel} \${f.required ? '*' : ''}</label>
                            <input type="\${inputType}" name="\${safeLabel}" value="\${val}" \${req} \${inputType==='number' && f.type==='decimal' ? 'step="any"' : ''} style="width: 100%;">
                        </div>
                    \`;
                }
            });
            container.innerHTML = html;
        }

        function openCreateModal() {
            document.getElementById('modal-title').textContent = 'Create New Entry';
            document.getElementById('crud-submission-id').value = '';
            
            buildDynamicForm(currentSelectedFormId, {});
            document.getElementById('crud-modal').style.display = 'flex';
        }

        function openEditModal(subId) {
            const sub = currentSubmissions.find(s => (s.submissionId || s.id || s._id) === subId);
            if (!sub) return;

            let dataToShow = JSON.parse(JSON.stringify(sub.data || {}));

            document.getElementById('modal-title').textContent = 'Edit Entry';
            document.getElementById('crud-submission-id').value = subId;
            
            buildDynamicForm(currentSelectedFormId, dataToShow);
            document.getElementById('crud-modal').style.display = 'flex';
        }

        function closeCrudModal() {
            document.getElementById('crud-modal').style.display = 'none';
        }

        async function saveCrudEntry(e) {
            if (e) e.preventDefault();
            if (!currentSelectedFormId) return;

            const subId = document.getElementById('crud-submission-id').value;
            
            let parsedData = {};
            const formElement = document.getElementById('crud-dynamic-form');
            const formData = new FormData(formElement);
            
            // Check if we are falling back to JSON or KV editor
            const kvKeys = formElement.querySelectorAll('.dynamic-kv-key');
            const kvVals = formElement.querySelectorAll('.dynamic-kv-val');
            
            if (kvKeys.length > 0) {
                // KV editor used
                for (let i = 0; i < kvKeys.length; i++) {
                    const k = kvKeys[i].value.trim();
                    let v = kvVals[i].value;
                    if (k) {
                        if (v === 'true') v = true;
                        else if (v === 'false') v = false;
                        else if (v !== '' && !isNaN(v)) v = Number(v);
                        else {
                            try { v = JSON.parse(v); } catch(e) {}
                        }
                        parsedData[k] = v;
                    }
                }
            } else if (formData.has('_json_data')) {
                try {
                    parsedData = JSON.parse(formData.get('_json_data'));
                } catch (err) {
                    alert("Invalid JSON format");
                    return;
                }
            } else {
                // Build object from form inputs
                formElement.querySelectorAll('input, select, textarea').forEach(input => {
                    if (input.type === 'submit' || input.type === 'hidden') return;
                    if (input.type === 'checkbox') {
                        if (input.name.endsWith('[]')) {
                            const actualName = input.name.replace('[]', '');
                            if (!parsedData[actualName]) parsedData[actualName] = [];
                            if (input.checked) parsedData[actualName].push(input.value);
                        } else {
                            parsedData[input.name] = input.checked;
                        }
                    } else if (input.type === 'number') {
                        parsedData[input.name] = input.value ? Number(input.value) : null;
                    } else {
                        parsedData[input.name] = input.value;
                    }
                });
            }

            // Convert role names back to role IDs before saving (for legacy KV compatibility)
            if (parsedData.roles && typeof parsedData.roles === 'string') {
                const r = roles.find(r => (r.data?.name || r.data?.text || r.submissionId || r.id || r._id) === parsedData.roles);
                if (r) parsedData.roles = r.submissionId || r.id || r._id;
            }
            if (parsedData.role && typeof parsedData.role === 'string') {
                const r = roles.find(r => (r.data?.name || r.data?.text || r.submissionId || r.id || r._id) === parsedData.role);
                if (r) parsedData.role = r.submissionId || r.id || r._id;
            }

            const btn = document.getElementById('btn-save-crud');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Saving...';

            try {
                if (subId) {
                    // Update existing
                    const url = \`\${POSTPIPE_URL}/api/public/references/\${currentSelectedFormId}\`;
                    const res = await fetch(url, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getSafeToken() },
                        body: JSON.stringify({ submissionId: subId, patch: parsedData })
                    });
                    if (res.ok) {
                        alert('Entry updated successfully!');
                        closeCrudModal();
                        selectDataForm(currentSelectedFormId, document.getElementById('selected-form-title').textContent.replace(' Data', ''));
                    } else {
                        throw new Error('Update failed');
                    }
                } else {
                    // Create new
                    // We can use the public submit route: POST /api/public/submit/:formId
                    const url = POSTPIPE_URL + '/api/public/submit/' + currentSelectedFormId;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(parsedData)
                    });
                    if (res.ok) {
                        alert('Entry created successfully!');
                        closeCrudModal();
                        selectDataForm(currentSelectedFormId, document.getElementById('selected-form-title').textContent.replace(' Data', ''));
                    } else {
                        throw new Error('Creation failed');
                    }
                }
            } catch (e) {
                alert('Error saving entry: ' + e.message);
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }

        async function deleteSubmission(subId) {
            if (!confirm('Are you sure you want to delete this entry?')) return;

            try {
                const url = \`\${POSTPIPE_URL}/api/public/references/\${currentSelectedFormId}\`;
                const res = await fetch(url, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getSafeToken() },
                    body: JSON.stringify({ submissionId: subId })
                });

                if (res.ok) {
                    alert('Entry deleted successfully!');
                    selectDataForm(currentSelectedFormId, document.getElementById('selected-form-title').textContent.replace(' Data', ''));
                } else {
                    throw new Error('Delete failed');
                }
            } catch (e) {
                alert('Error deleting entry: ' + e.message);
            }
        }

        // Auto-login if token exists
        if (getSafeToken()) {
            initDashboard();
        }
    </script>
</body>

</html>\n`.trim();

    return (
        <div className='p-6 bg-indigo-50/30 dark:bg-indigo-950/5 border-t border-neutral-200/60 dark:border-white/[0.04]'>
            <div className='flex justify-between items-center mb-6 border-b border-neutral-200 dark:border-white/10 pb-4'>
                    <Button variant={activeTab === 'overview' ? 'default' : 'ghost'} size='sm' onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'bg-violet-600 hover:bg-violet-500' : ''}>Overview</Button>
                    <Button variant={activeTab === 'react' ? 'default' : 'ghost'} size='sm' onClick={() => setActiveTab('react')} className={activeTab === 'react' ? 'bg-violet-600 hover:bg-violet-500 text-white' : ''}><Code2 className='w-4 h-4 mr-2'/> React Snippet</Button>
                    <Button variant={activeTab === 'html' ? 'default' : 'ghost'} size='sm' onClick={() => setActiveTab('html')} className={activeTab === 'html' ? 'bg-violet-600 hover:bg-violet-500 text-white' : ''}><Code2 className='w-4 h-4 mr-2'/> Admin Panel HTML</Button>
                    <Button variant={activeTab === 'portal' ? 'default' : 'ghost'} size='sm' onClick={() => setActiveTab('portal')} className={activeTab === 'portal' ? 'bg-violet-600 hover:bg-violet-500 text-white' : ''}><Code2 className='w-4 h-4 mr-2'/> Portal HTML</Button>
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

            {activeTab === 'portal' && (
                <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                        <h4 className='text-sm font-semibold text-neutral-900 dark:text-white'>Public User Portal HTML</h4>
                        <Button size='sm' variant='outline' onClick={() => copyCode(portalHtmlSnippet)}><Copy className='w-4 h-4 mr-2'/> Copy Full Code</Button>
                    </div>
                    <p className='text-xs text-neutral-500'>This HTML file combines the submission forms for all your managed resources, making it easy to create a public-facing data entry portal.</p>
                    <pre className='p-4 rounded-xl bg-neutral-950 text-neutral-300 text-xs font-mono overflow-x-auto whitespace-pre'>
                        {portalHtmlSnippet}
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
