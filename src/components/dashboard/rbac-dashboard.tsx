'use client';

import * as React from 'react';
import {
  Shield, Plus, Trash2, Check, Copy, RotateCw,
  Terminal, Code, ChevronDown, ChevronRight,
  Key, FileText, Lock, CheckCircle2, Circle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { dispatchRBACWebhookAction } from '@/app/actions/rbac';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Permission {
  action: string;       // e.g. "event.create"
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemDefault: boolean;
}

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

// ─── Step Indicator ─────────────────────────────────────────────────────────

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={cn(
      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all border-2',
      done  ? 'bg-emerald-500 border-emerald-500 text-white'
           : active ? 'bg-violet-600 border-violet-600 text-white'
           : 'bg-transparent border-neutral-300 dark:border-white/15 text-neutral-400 dark:text-white/30'
    )}>
      {done ? <Check className="h-3.5 w-3.5" /> : n}
    </div>
  );
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div className={cn(
      'h-0.5 flex-1 transition-all rounded-full',
      done ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-white/10'
    )} />
  );
}

// ─── Section Card ────────────────────────────────────────────────────────────

function SectionCard({
  step, title, subtitle, active, done, children
}: {
  step: number; title: string; subtitle: string;
  active: boolean; done: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn(
      'rounded-2xl border transition-all duration-300',
      active
        ? 'border-violet-500/40 dark:border-violet-500/30 bg-white dark:bg-zinc-900/60 shadow-lg shadow-violet-500/5'
        : done
          ? 'border-emerald-500/25 bg-white/60 dark:bg-zinc-900/40'
          : 'border-neutral-200 dark:border-white/5 bg-neutral-50/50 dark:bg-zinc-950/40 opacity-60'
    )}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-white/5">
        <StepBadge n={step} active={active} done={done} />
        <div>
          <h3 className="text-sm font-bold text-neutral-800 dark:text-white">{title}</h3>
          <p className="text-xs text-neutral-400 dark:text-white/40 mt-0.5">{subtitle}</p>
        </div>
        {done && (
          <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold text-[10px]">
            Done
          </Badge>
        )}
      </div>
      <div className={cn('p-5', !active && !done && 'pointer-events-none select-none')}>
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

// These are SUGGESTIONS only — shown as clickable chips, not auto-added
const SUGGESTED_PERMISSIONS: Permission[] = [
  { action: 'event.create',      description: 'Create and schedule events' },
  { action: 'event.delete',      description: 'Remove existing events' },
  { action: 'post.publish',      description: 'Publish blog posts or articles' },
  { action: 'payment.refund',    description: 'Issue customer refunds' },
  { action: 'team.invite',       description: 'Invite staff to the workspace' },
  { action: 'report.view',       description: 'View analytics and reports' },
];

export default function RBACDashboard({ system, connectorSecret, onBack }: { system: any; connectorSecret: string; onBack: () => void }) {
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Data — initialize from system state
  const [permissions, setPermissions] = React.useState<Permission[]>(system?.state?.permissions || []);
  const [roles, setRoles]             = React.useState<Role[]>(system?.state?.roles || []);
  const [auditLogs, setAuditLogs]     = React.useState<AuditLog[]>([]);

  // Step 1 form
  const [newAction, setNewAction]   = React.useState('');
  const [newDesc, setNewDesc]       = React.useState('');
  const [step1Error, setStep1Error] = React.useState('');

  // Step 2
  const [selectedRoleId, setSelectedRoleId]     = React.useState<string | null>(system?.state?.roles?.[0]?.id || null);
  const [newRoleName, setNewRoleName]           = React.useState('');
  const [newRoleDesc, setNewRoleDesc]           = React.useState('');

  // Step 3
  const [framework, setFramework] = React.useState<'react' | 'html'>('react');
  const [copied, setCopied]       = React.useState(false);

  // Advanced accordion
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [apiKeys] = React.useState([
    { id: 'k1', name: 'Production Key', prefix: 'pp_live_•••', scope: 'submissions.view', createdAt: '2026-05-28' },
  ]);

  // Derived
  const step1Done = permissions.length > 0;
  const step2Done = step1Done && roles.length > 0;
  const activeRole = roles.find(r => r.id === selectedRoleId) ?? roles[0] ?? null;

  // Sync helper
  const sync = async (perms: Permission[], rls: Role[]) => {
    setIsSyncing(true);
    try {
      const res = await dispatchRBACWebhookAction(system.connectorId, {
        permissions: perms, roles: rls, users: []
      }, system.id);
      if (res.success) {
        toast({ title: 'Saved & Synced ✓', description: 'RBAC schema successfully updated on your connector.' });
      } else {
        // Safe locally but webhook failed (e.g. 404 or offline)
        toast({
          title: 'Saved in Postpipe (Sync pending)',
          description: `${res.error}. (You can still pull the state using the API snippet below).`,
          variant: 'default',
        });
      }
    } catch (e: any) {
      toast({
        title: 'Saved in Postpipe (Network warning)',
        description: `Failed to notify connector: ${e.message}. State was successfully stored locally.`,
        variant: 'default',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all permissions and roles for this connector? This will clear the configuration in your database.")) {
      return;
    }
    setPermissions([]);
    setRoles([]);
    setSelectedRoleId(null);
    setAuditLogs([]);
    await sync([], []);
  };

  // ── Step 1 Handlers ──────────────────────────────────────────────────────

  const handleAddPermission = (e: React.FormEvent) => {
    e.preventDefault();
    const action = newAction.trim().toLowerCase();
    if (!action.includes('.')) {
      setStep1Error('Use dot notation — e.g. event.create');
      return;
    }
    if (permissions.find(p => p.action === action)) {
      setStep1Error('That permission already exists.');
      return;
    }
    setStep1Error('');
    const updated = [...permissions, { action, description: newDesc.trim() || `Allow ${action}` }];
    setPermissions(updated);
    setNewAction('');
    setNewDesc('');
    setAuditLogs(prev => [{ id: Math.random().toString(), actor: 'you', action: 'permission.add', target: action, time: 'just now' }, ...prev]);
    sync(updated, roles);
  };

  const handleDeletePermission = (action: string) => {
    const updated = permissions.filter(p => p.action !== action);
    setPermissions(updated);
    // Remove from all roles too
    const updatedRoles = roles.map(r => ({ ...r, permissions: r.permissions.filter(p => p !== action) }));
    setRoles(updatedRoles);
    sync(updated, updatedRoles);
  };

  // ── Step 2 Handlers ──────────────────────────────────────────────────────

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const newRole: Role = {
      id: Math.random().toString(36).slice(2),
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Custom role',
      permissions: [],
      isSystemDefault: false,
    };
    const updated = [...roles, newRole];
    setRoles(updated);
    setSelectedRoleId(newRole.id);
    setNewRoleName('');
    setNewRoleDesc('');
    sync(permissions, updated);
    setAuditLogs(prev => [{ id: Math.random().toString(), actor: 'you', action: 'role.create', target: newRole.name, time: 'just now' }, ...prev]);
  };

  const handleTogglePerm = (action: string) => {
    if (!activeRole || activeRole.isSystemDefault) return;
    const updated = roles.map(r => {
      if (r.id !== activeRole.id) return r;
      const has = r.permissions.includes(action);
      return { ...r, permissions: has ? r.permissions.filter(p => p !== action) : [...r.permissions, action] };
    });
    setRoles(updated);
    sync(permissions, updated);
  };

  // ── Step 3 Code ──────────────────────────────────────────────────────────

  const connectorId = system?.connectorId || 'YOUR_CONNECTOR_ID';
  
  const codeSnippets = {
    react: `import React, { useState } from 'react';

// Hardcoded for your specific PostPipe project
const POSTPIPE_PROJECT_ID = "${connectorId}";
const POSTPIPE_API_URL = "https://api.postpipe.com/v1/rbac";

export function RBACMicroFrontend() {
  const [token, setToken] = useState(localStorage.getItem('rbac_token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [assignRoleEmail, setAssignRoleEmail] = useState('');
  const [roleToAssign, setRoleToAssign] = useState('Editor');

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(\`\${POSTPIPE_API_URL}/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-project-id': POSTPIPE_PROJECT_ID },
      body: JSON.stringify({ email, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('rbac_token', data.token);
      alert('Login successful!');
    } else {
      alert('Login failed');
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    const res = await fetch(\`\${POSTPIPE_API_URL}/assign-role\`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-project-id': POSTPIPE_PROJECT_ID,
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({ email: assignRoleEmail, role: roleToAssign })
    });

    if (res.ok) {
      alert('Role assigned successfully!');
    } else {
      alert('Failed to assign role. You might not have the required permissions.');
    }
  };

  if (!token) {
    return (
      <form onSubmit={handleLogin} style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
        <h3 style={{ marginBottom: '16px' }}>Login</h3>
        <input style={{ display: 'block', width: '100%', marginBottom: '8px', padding: '8px' }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input style={{ display: 'block', width: '100%', marginBottom: '16px', padding: '8px' }} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button style={{ width: '100%', padding: '10px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '4px' }} type="submit">Login</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleAssignRole} style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
      <h3 style={{ marginBottom: '16px' }}>Assign Role (Requires Admin)</h3>
      <input style={{ display: 'block', width: '100%', marginBottom: '8px', padding: '8px' }} type="email" value={assignRoleEmail} onChange={e => setAssignRoleEmail(e.target.value)} placeholder="User Email" required />
      <input style={{ display: 'block', width: '100%', marginBottom: '16px', padding: '8px' }} type="text" value={roleToAssign} onChange={e => setRoleToAssign(e.target.value)} placeholder="Role (e.g., Editor)" required />
      <button style={{ width: '100%', padding: '10px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '4px', marginBottom: '8px' }} type="submit">Assign Role</button>
      <button style={{ width: '100%', padding: '10px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '4px' }} type="button" onClick={() => { setToken(''); localStorage.removeItem('rbac_token'); }}>Logout</button>
    </form>
  );
}`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PostPipe RBAC Client</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    form { border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 400px; margin-bottom: 20px; }
    input, button { display: block; width: 100%; margin-bottom: 12px; padding: 8px; box-sizing: border-box; }
    button { background: #4F46E5; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button.logout { background: #EF4444; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div id="login-container">
    <form id="login-form">
      <h3>Login</h3>
      <input type="email" id="login-email" placeholder="Email" required>
      <input type="password" id="login-password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  </div>

  <div id="rbac-container" class="hidden">
    <form id="assign-role-form">
      <h3>Assign Role (Requires Admin)</h3>
      <input type="email" id="assign-email" placeholder="User Email" required>
      <input type="text" id="assign-role" placeholder="Role (e.g., Editor)" required>
      <button type="submit">Assign Role</button>
      <button type="button" id="logout-btn" class="logout">Logout</button>
    </form>
  </div>

  <script>
    const POSTPIPE_PROJECT_ID = "${connectorId}";
    const POSTPIPE_API_URL = "https://api.postpipe.com/v1/rbac";

    const loginContainer = document.getElementById('login-container');
    const rbacContainer = document.getElementById('rbac-container');
    const loginForm = document.getElementById('login-form');
    const assignForm = document.getElementById('assign-role-form');
    const logoutBtn = document.getElementById('logout-btn');

    let token = localStorage.getItem('rbac_token') || '';

    function updateUI() {
      if (token) {
        loginContainer.classList.add('hidden');
        rbacContainer.classList.remove('hidden');
      } else {
        loginContainer.classList.remove('hidden');
        rbacContainer.classList.add('hidden');
      }
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      const res = await fetch(\`\${POSTPIPE_API_URL}/login\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': POSTPIPE_PROJECT_ID },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        token = data.token;
        localStorage.setItem('rbac_token', token);
        updateUI();
        alert('Login successful!');
      } else {
        alert('Login failed');
      }
    });

    assignForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('assign-email').value;
      const role = document.getElementById('assign-role').value;

      const res = await fetch(\`\${POSTPIPE_API_URL}/assign-role\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-project-id': POSTPIPE_PROJECT_ID,
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ email, role })
      });

      if (res.ok) {
        alert('Role assigned successfully!');
      } else {
        alert('Failed to assign role');
      }
    });

    logoutBtn.addEventListener('click', () => {
      token = '';
      localStorage.removeItem('rbac_token');
      updateUI();
    });

    updateUI();
  </script>
</body>
</html>`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[framework]);
    setCopied(true);
    toast({ title: 'Code copied to clipboard ✓' });
    setTimeout(() => setCopied(false), 2500);
  };

  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 pb-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onBack} className="px-2 h-8 text-neutral-500 hover:text-neutral-800 dark:hover:text-white mr-1 border border-neutral-200 dark:border-white/10 rounded-lg">
               &larr; Back
            </Button>
            <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
            <h2 className="text-xl font-black tracking-tight text-neutral-800 dark:text-white">
              {system.name}
            </h2>
            <Badge variant="outline" className="text-[10px] ml-2 text-violet-600 dark:text-violet-400 border-violet-500/30">
              RBAC System
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 dark:text-white/40 mt-1 ml-[72px]">
            Define permissions, build roles, then connect your app — three steps.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isSyncing || (permissions.length === 0 && roles.length === 0)}
            className="h-8 text-xs bg-white dark:bg-zinc-900 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 border-red-200 dark:border-red-500/20 gap-1.5"
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => sync(permissions, roles)}
            disabled={isSyncing}
            className="h-8 text-xs bg-white dark:bg-zinc-900 gap-1.5"
          >
            <RotateCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
            Sync
          </Button>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="flex items-center gap-2 px-1">
        <StepBadge n={1} active={!step1Done} done={step1Done} />
        <span className={cn('text-xs font-semibold hidden sm:block', step1Done ? 'text-emerald-500' : 'text-violet-600 dark:text-violet-400')}>Permissions</span>
        <StepConnector done={step1Done} />
        <StepBadge n={2} active={step1Done && !step2Done} done={step2Done} />
        <span className={cn('text-xs font-semibold hidden sm:block', step2Done ? 'text-emerald-500' : step1Done ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-400')}>Roles</span>
        <StepConnector done={step2Done} />
        <StepBadge n={3} active={step2Done} done={false} />
        <span className={cn('text-xs font-semibold hidden sm:block', step2Done ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-400')}>Connect</span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STEP 1: WHAT CAN PEOPLE DO?                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionCard
        step={1}
        title="What can people do?"
        subtitle="Define the actions your app supports. Use dot notation: resource.action"
        active={!step1Done}
        done={step1Done}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input */}
          <form onSubmit={handleAddPermission} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-wider block mb-1.5">
                Permission (e.g. event.create)
              </label>
              <Input
                placeholder="event.create"
                value={newAction}
                onChange={e => { setNewAction(e.target.value); setStep1Error(''); }}
                className="h-9 rounded-lg text-sm font-mono"
                required
              />
              {step1Error && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {step1Error}
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-wider block mb-1.5">
                Description (optional)
              </label>
              <Input
                placeholder="What does this permission allow?"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="h-9 rounded-lg text-xs"
              />
            </div>
            <Button type="submit" className="h-9 rounded-lg text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 w-full sm:w-auto">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Permission
            </Button>
          </form>

          {/* Right column: suggestions when empty, live list when populated */}
          <div className="flex flex-col gap-3">
            {permissions.length === 0 ? (
              <div>
                <p className="text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-wider mb-2">
                  Quick add — click to add:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PERMISSIONS.map(s => (
                    <button
                      key={s.action}
                      type="button"
                      onClick={() => {
                        const updated = [...permissions, s];
                        setPermissions(updated);
                        setAuditLogs(prev => [{ id: Math.random().toString(), actor: 'you', action: 'permission.add', target: s.action, time: 'just now' }, ...prev]);
                        sync(updated, roles);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5 text-violet-700 dark:text-violet-300 text-xs font-mono font-semibold hover:bg-violet-100 dark:hover:bg-violet-500/15 transition-all"
                    >
                      <Plus className="h-3 w-3" />
                      {s.action}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400 dark:text-white/30 mt-3">
                  Or type a custom one using the form on the left.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                <p className="text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-wider mb-1">
                  {permissions.length} permission{permissions.length !== 1 ? 's' : ''} registered
                </p>
                {permissions.map(p => (
                  <div
                    key={p.action}
                    className="flex items-center justify-between gap-2 bg-neutral-50/50 dark:bg-zinc-950/40 border border-neutral-200 dark:border-white/5 rounded-lg px-3 py-2 group"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">{p.action}</span>
                      <p className="text-[10px] text-neutral-400 dark:text-white/30 truncate">{p.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePermission(p.action)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {/* Show remaining suggestions as smaller chips */}
                {SUGGESTED_PERMISSIONS.filter(s => !permissions.find(p => p.action === s.action)).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {SUGGESTED_PERMISSIONS.filter(s => !permissions.find(p => p.action === s.action)).map(s => (
                      <button
                        key={s.action}
                        type="button"
                        onClick={() => {
                          const updated = [...permissions, s];
                          setPermissions(updated);
                          setAuditLogs(prev => [{ id: Math.random().toString(), actor: 'you', action: 'permission.add', target: s.action, time: 'just now' }, ...prev]);
                          sync(updated, roles);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-neutral-300 dark:border-white/10 text-neutral-400 dark:text-white/30 text-[10px] font-mono hover:border-violet-400 hover:text-violet-500 transition-all"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        {s.action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STEP 2: WHO ARE YOUR ROLES?                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionCard
        step={2}
        title="Who are your roles?"
        subtitle="Create roles, then pick which permissions each role can perform."
        active={step1Done && !step2Done}
        done={step2Done}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: create + role list */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <form onSubmit={handleCreateRole} className="flex gap-2">
              <Input
                placeholder="Role name, e.g. Editor"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                className="h-9 rounded-lg text-xs flex-1"
              />
              <Button type="submit" size="sm" className="h-9 rounded-lg text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </form>

            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-0.5">
              {roles.length === 0 && (
                <div className="text-xs text-neutral-400 dark:text-white/30 text-center py-6 border border-dashed border-neutral-200 dark:border-white/10 rounded-xl">
                  Create your first role above
                </div>
              )}
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={cn(
                    'text-left flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all',
                    selectedRoleId === r.id
                      ? 'border-violet-500/50 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300'
                      : 'border-neutral-200 dark:border-white/5 hover:bg-neutral-50/50 dark:hover:bg-zinc-950/40'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">{r.name}</span>
                      {r.isSystemDefault && (
                        <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">System</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 dark:text-white/30 mt-0.5">
                      {r.permissions.length} permission{r.permissions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-30 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: permission matrix */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-white/5 pt-4 lg:pt-0 lg:pl-5">
            {!activeRole ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[180px] rounded-xl border border-dashed border-neutral-200 dark:border-white/10">
                <Shield className="h-7 w-7 text-neutral-300 dark:text-white/15 mb-2" />
                <p className="text-xs text-neutral-400 dark:text-white/30">Select a role to set permissions</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-neutral-700 dark:text-white">
                      Permissions for{' '}
                      <span className="text-violet-600 dark:text-violet-400">{activeRole.name}</span>
                    </span>
                    {activeRole.isSystemDefault && (
                      <p className="text-[10px] text-amber-500 flex items-center gap-1 mt-0.5">
                        <Lock className="h-2.5 w-2.5" /> System roles cannot be edited
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {activeRole.isSystemDefault ? 'All' : activeRole.permissions.length} / {permissions.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
                  {permissions.map(p => {
                    const granted = activeRole.isSystemDefault || activeRole.permissions.includes(p.action);
                    return (
                      <div
                        key={p.action}
                        onClick={() => handleTogglePerm(p.action)}
                        className={cn(
                          'flex items-start gap-2.5 p-2.5 rounded-xl border transition-all',
                          activeRole.isSystemDefault ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-zinc-950/40',
                          granted
                            ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5'
                            : 'border-neutral-200 dark:border-white/5'
                        )}
                      >
                        <div className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border mt-0.5 transition-all',
                          granted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-neutral-300 dark:border-white/20'
                        )}>
                          {granted && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-mono font-bold text-neutral-700 dark:text-white/80 truncate">
                            {p.action}
                          </p>
                          <p className="text-[9px] text-neutral-400 dark:text-white/30 mt-0.5 leading-tight">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STEP 3: CONNECT YOUR APP                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionCard
        step={3}
        title="Connect your app"
        subtitle="Embed these client-side snippets in your application to authenticate users and manage roles statelessly."
        active={step2Done}
        done={false}
      >
        {/* Framework selector */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/5 w-fit mb-4">
          {([
            { id: 'react', label: 'React' },
            { id: 'html',  label: 'HTML / Vanilla JS'  },
          ] as const).map(fw => (
            <button
              key={fw.id}
              onClick={() => setFramework(fw.id)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                framework === fw.id
                  ? 'bg-white dark:bg-white/10 text-neutral-800 dark:text-white shadow-sm'
                  : 'text-neutral-400 dark:text-white/40 hover:text-neutral-700 dark:hover:text-white'
              )}
            >
              {fw.label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="rounded-xl overflow-hidden border border-white/5 bg-zinc-950">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-[10px] font-mono text-neutral-500">
              {framework === 'react' ? 'RBACMicroFrontend.tsx' : 'index.html'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-neutral-400 hover:text-white hover:bg-white/10 text-xs gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="p-4 text-neutral-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-72">
            <code>{codeSnippets[framework]}</code>
          </pre>
        </div>

        <p className="text-xs text-neutral-400 dark:text-white/30 mt-3 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
          These snippets make stateless calls directly to PostPipe's routing layer. No backend proxy required.
        </p>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ADVANCED ACCORDION                                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setShowAdvanced(v => !v)}
        className="flex items-center gap-2 text-xs text-neutral-400 dark:text-white/30 hover:text-neutral-600 dark:hover:text-white/60 transition-colors self-start ml-1"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showAdvanced && 'rotate-180')} />
        {showAdvanced ? 'Hide' : 'Show'} advanced (API Keys &amp; Audit Trail)
      </button>

      {showAdvanced && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* API Keys */}
          <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-neutral-400" />
                <span className="text-sm font-bold text-neutral-700 dark:text-white">API Keys</span>
              </div>
              <Button size="sm" className="h-7 text-[10px] bg-violet-600 text-white hover:bg-violet-500 rounded-lg">
                <Plus className="h-3 w-3 mr-1" /> Generate
              </Button>
            </div>
            <div className="space-y-2">
              {apiKeys.map(k => (
                <div key={k.id} className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/5 px-3 py-2.5 bg-neutral-50/50 dark:bg-zinc-950/40">
                  <div>
                    <p className="text-xs font-semibold text-neutral-700 dark:text-white/80">{k.name}</p>
                    <p className="text-[10px] font-mono text-neutral-400 dark:text-white/30">{k.prefix}</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] text-violet-600 dark:text-violet-400">{k.scope}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-neutral-400" />
              <span className="text-sm font-bold text-neutral-700 dark:text-white">Audit Trail</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="flex items-center gap-3 py-1.5 border-b border-neutral-100 dark:border-white/5 last:border-0">
                  <Badge className="bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 border-none font-mono text-[9px] whitespace-nowrap">
                    {log.action}
                  </Badge>
                  <span className="text-[10px] text-neutral-500 dark:text-white/40 truncate min-w-0">{log.target}</span>
                  <span className="text-[10px] text-neutral-300 dark:text-white/20 ml-auto whitespace-nowrap">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
