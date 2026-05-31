'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal, Code, Settings, UserPlus, Database, ArrowLeft, Shield, Lock, CheckCircle2, Circle, AlertCircle, RefreshCw, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { saveRBACProjectConfigAction, bootstrapMasterAdminAction } from '@/app/actions/rbac';

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

export default function RBACSetup({ system, onBack }: { system: any; onBack: () => void }) {
  const [framework, setFramework] = useState<'react' | 'html'>('react');
  const [copied, setCopied] = useState(false);
  const systemId = system.id;
  const connectorId = system.connectorId;

  // Step 1 done status derived from database
  const [step1Done, setStep1Done] = useState(!!system.schemaMapping);
  const [step2Done, setStep2Done] = useState(false);

  // Active step derivation
  const step1Active = !step1Done;
  const step2Active = step1Done && !step2Done;
  const step3Active = step1Done && step2Done;

  // Step 3A: Schema Mapping
  const [schemaMapping, setSchemaMapping] = useState(system.schemaMapping || {
    usersTable: 'users',
    rolesTable: 'roles',
    permissionsTable: 'permissions',
    userRolesTable: 'user_roles',
    rolePermissionsTable: 'role_permissions',
    fields: {
      userId: 'id',
      email: 'email',
      passwordHash: 'password_hash',
      roleName: 'name',
      roleId: 'id',
      permissionAction: 'action',
      permissionId: 'id'
    }
  });

  // Step 3B: Security Config
  const [jwtSecret, setJwtSecret] = useState(system.jwtConfig ? '••••••••' : '');
  const [dbType, setDbType] = useState<'postgres' | 'mongodb' | 'mysql'>(system.databaseType || 'postgres');

  // Step 3C: Admin Bootstrap
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const payload: any = {
        databaseType: dbType,
        schemaMapping,
        jwtConfig: {
          accessTokenExpiry: '1h',
          refreshTokenExpiry: '7d',
          hashingRounds: 12
        }
      };

      if (jwtSecret && jwtSecret !== '••••••••') {
        payload.jwtConfig.secret = jwtSecret;
      } else if (system.jwtConfig) {
        // Reuse original secret configuration structure (encrypted)
        payload.jwtConfig.encryptedSecret = system.jwtConfig.encryptedSecret;
      } else {
        // Generate fallback secret if new and empty
        payload.jwtConfig.secret = 'postpipe_secret_key_random_' + Math.random().toString(36).substr(2, 9);
      }

      await saveRBACProjectConfigAction(systemId, payload);
      toast({ title: 'Config saved successfully!' });
      setStep1Done(true);
    } catch (e: any) {
      toast({ title: 'Failed to save config', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapping(true);
    try {
      const res = await bootstrapMasterAdminAction(systemId, { email: adminEmail, password: adminPassword });
      if (res.success) {
        toast({ title: 'Admin bootstrapped successfully!' });
        setStep2Done(true);
      } else {
        toast({ title: 'Bootstrap failed', description: res.error, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Failed to bootstrap', description: e.message, variant: 'destructive' });
    } finally {
      setBootstrapping(false);
    }
  };

  const reactSnippet = `import React, { createContext, useContext, useState, useEffect } from 'react';

// PostPipe Stateless RBAC Configuration
const POSTPIPE_PROJECT_ID = "${systemId}";
const POSTPIPE_API_URL = "http://localhost:8080/api/v1/rbac"; // Update for production

const AuthContext = createContext(null);

export const PostpipeAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pp_access_token'));

  useEffect(() => {
    if (token) {
      fetch(\`\${POSTPIPE_API_URL}/me\`, {
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'x-project-id': POSTPIPE_PROJECT_ID
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.data);
        else logout();
      })
      .catch(() => logout());
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(\`\${POSTPIPE_API_URL}/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-project-id': POSTPIPE_PROJECT_ID },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.data.accessToken);
      localStorage.setItem('pp_access_token', data.data.accessToken);
      setUser(data.data.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pp_access_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const useRBAC = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  return { hasPermission, hasRole };
};`;

  const htmlSnippet = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PostPipe Stateless RBAC</title>
  <script>
    const POSTPIPE_PROJECT_ID = "${systemId}";
    const POSTPIPE_API_URL = "http://localhost:8080/api/v1/rbac";
    
    async function login(email, password) {
      const res = await fetch(\`\${POSTPIPE_API_URL}/login\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-project-id': POSTPIPE_PROJECT_ID },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('pp_access_token', data.data.accessToken);
        alert('Logged in!');
      } else {
        alert('Login failed');
      }
    }
  </script>
</head>
<body>
  <h2>Login</h2>
  <form onsubmit="event.preventDefault(); login(this.email.value, this.password.value);">
    <input name="email" type="email" placeholder="Email" required />
    <input name="password" type="password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(framework === 'react' ? reactSnippet : htmlSnippet);
    setCopied(true);
    toast({ title: 'Snippet copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Header */}
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
            <Badge variant="outline" className="text-[10px] ml-2 text-violet-600 dark:text-violet-400 border-violet-500/30 font-bold uppercase">
              Stateless RBAC Setup
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 dark:text-white/40 mt-1 ml-[72px]">
            Map your connector's database tables, bootstrap admin account, then connect.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 px-1">
        <StepBadge n={1} active={step1Active} done={step1Done} />
        <span className={cn('text-xs font-semibold hidden sm:block', step1Done ? 'text-emerald-500' : 'text-violet-600 dark:text-violet-400')}>Schema Mapping</span>
        <StepConnector done={step1Done} />
        <StepBadge n={2} active={step2Active} done={step2Done} />
        <span className={cn('text-xs font-semibold hidden sm:block', step2Done ? 'text-emerald-500' : step1Done ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-400')}>Bootstrap Admin</span>
        <StepConnector done={step2Done} />
        <StepBadge n={3} active={step3Active} done={false} />
        <span className={cn('text-xs font-semibold hidden sm:block', step3Active ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-400')}>Embed & Connect</span>
      </div>

      {/* STEP 1: SCHEMA MAPPING */}
      <SectionCard
        step={1}
        title="Schema & Security Configuration"
        subtitle="Map PostPipe's canonical models to your specific database tables/collections and setup JWT."
        active={step1Active}
        done={step1Done}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-wider block mb-1.5">
                Database Type
              </label>
              <select
                className="flex h-9 w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-zinc-950 px-3 py-1 text-sm focus:ring-1 focus:ring-violet-500/40 text-neutral-800 dark:text-white/80"
                value={dbType}
                onChange={e => setDbType(e.target.value as any)}
              >
                <option value="postgres">PostgreSQL</option>
                <option value="mongodb">MongoDB</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-wider block mb-1.5">
                Users Table / Collection
              </label>
              <Input
                value={schemaMapping.usersTable}
                onChange={e => setSchemaMapping({...schemaMapping, usersTable: e.target.value})}
                placeholder="users"
                className="h-9 rounded-lg text-sm font-mono bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-white/10"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-wider block mb-1.5">
                Roles Table / Collection
              </label>
              <Input
                value={schemaMapping.rolesTable}
                onChange={e => setSchemaMapping({...schemaMapping, rolesTable: e.target.value})}
                placeholder="roles"
                className="h-9 rounded-lg text-sm font-mono bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-white/10"
              />
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-white/5 pt-4">
            <h4 className="text-xs font-bold text-neutral-700 dark:text-white/60 mb-3 flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5 text-violet-500" />
              Advanced Field Mapping
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] text-neutral-400 dark:text-white/30 block mb-1">User ID Field</label>
                <Input
                  value={schemaMapping.fields.userId}
                  onChange={e => setSchemaMapping({
                    ...schemaMapping,
                    fields: { ...schemaMapping.fields, userId: e.target.value }
                  })}
                  className="h-8 rounded-lg text-xs font-mono bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-white/10"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 dark:text-white/30 block mb-1">Email Field</label>
                <Input
                  value={schemaMapping.fields.email}
                  onChange={e => setSchemaMapping({
                    ...schemaMapping,
                    fields: { ...schemaMapping.fields, email: e.target.value }
                  })}
                  className="h-8 rounded-lg text-xs font-mono bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-white/10"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 dark:text-white/30 block mb-1">Password Hash Field</label>
                <Input
                  value={schemaMapping.fields.passwordHash}
                  onChange={e => setSchemaMapping({
                    ...schemaMapping,
                    fields: { ...schemaMapping.fields, passwordHash: e.target.value }
                  })}
                  className="h-8 rounded-lg text-xs font-mono bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-white/10"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 dark:text-white/30 block mb-1">Role Name Field</label>
                <Input
                  value={schemaMapping.fields.roleName}
                  onChange={e => setSchemaMapping({
                    ...schemaMapping,
                    fields: { ...schemaMapping.fields, roleName: e.target.value }
                  })}
                  className="h-8 rounded-lg text-xs font-mono bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-white/10"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-white/5 pt-4">
            <h4 className="text-xs font-bold text-neutral-700 dark:text-white/60 mb-3 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-violet-500" />
              Security (JWT Secret)
            </h4>
            <div className="max-w-md">
              <label className="text-[10px] text-neutral-400 dark:text-white/30 block mb-1">Decryption Secret (AES-256-GCM)</label>
              <Input
                type="password"
                value={jwtSecret}
                onChange={e => setJwtSecret(e.target.value)}
                placeholder="Leave blank or keep placeholder to keep current config"
                className="h-9 rounded-lg text-sm bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-white/10"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-neutral-100 dark:border-white/5 pt-4">
            {step1Done && (
              <Button type="button" variant="outline" onClick={() => setStep1Done(false)} className="h-9 text-xs rounded-lg border-neutral-200 dark:border-white/10 text-neutral-500 hover:text-neutral-800">
                Unlock Config
              </Button>
            )}
            <Button
              onClick={handleSaveConfig}
              disabled={saving}
              className="h-9 text-xs rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 gap-1.5"
            >
              {saving && <RefreshCw className="h-3 w-3 animate-spin" />}
              Save & Synchronize Config
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* STEP 2: MASTER ADMIN BOOTSTRAP */}
      <SectionCard
        step={2}
        title="Bootstrap Master Admin User"
        subtitle="PostPipe routes this instruction straight to your connector. We do not store this password locally."
        active={step2Active}
        done={step2Done}
      >
        <div className="max-w-lg">
          <p className="text-xs text-neutral-400 dark:text-white/30 mb-4 flex items-start gap-1.5 bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 p-3 rounded-xl">
            <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            Security Notice: Storing passwords locally in a central SaaS hub is a risk. PostPipe translates this creation command into an abstract insert statement, signs it, and passes it directly to your live database adapter.
          </p>

          <form onSubmit={handleBootstrap} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-wider block mb-1.5">
                Admin Email Address
              </label>
              <Input
                type="email"
                placeholder="admin@yourdomain.com"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="h-9 rounded-lg text-sm bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-white/10"
                required
                disabled={!step1Done}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-400 dark:text-white/40 uppercase tracking-wider block mb-1.5">
                Admin Password
              </label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="h-9 rounded-lg text-sm bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-white/10"
                required
                disabled={!step1Done}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-neutral-100 dark:border-white/5 pt-4">
              {step2Done && (
                <Button type="button" variant="outline" onClick={() => setStep2Done(false)} className="h-9 text-xs rounded-lg border-neutral-200 dark:border-white/10 text-neutral-500">
                  Reset Check
                </Button>
              )}
              <Button
                type="submit"
                disabled={bootstrapping || !step1Done}
                className="h-9 text-xs rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 gap-1.5"
              >
                {bootstrapping && <RefreshCw className="h-3 w-3 animate-spin" />}
                Bootstrap Admin User
              </Button>
            </div>
          </form>
        </div>
      </SectionCard>

      {/* STEP 3: EMBED SNIPPETS */}
      <SectionCard
        step={3}
        title="Connect Your App"
        subtitle="Copy and paste this micro-frontend logic inside your frontend code to complete the integration."
        active={step3Active}
        done={false}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/5 w-fit">
            {([
              { id: 'react', label: 'React Provider' },
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

          <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-white/5 bg-zinc-950 relative">
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-white/5">
              <span className="text-[10px] font-mono text-neutral-500">
                {framework === 'react' ? 'PostpipeAuthProvider.tsx' : 'login.html'}
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
            <pre className="p-4 text-neutral-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96">
              <code>{framework === 'react' ? reactSnippet : htmlSnippet}</code>
            </pre>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
