'use client';

import * as React from 'react';
import { Shield, Plus, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
// Note to developer: We are assuming you use shadcn/ui. 
// If not, replace these with standard HTML buttons/inputs or your own components.
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemDefault: boolean;
}

interface PermissionSchema {
  action: string;
  resource: string;
  description: string;
}

interface PostpipeRoleManagerProps {
  /** The public connect key for your Postpipe RBAC System */
  publishableKey: string;
  /** Optional theme override */
  className?: string;
}

export function PostpipeRoleManager({ publishableKey, className }: PostpipeRoleManagerProps) {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [schema, setSchema] = React.useState<PermissionSchema[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [newRoleName, setNewRoleName] = React.useState('');
  const [newRoleDesc, setNewRoleDesc] = React.useState('');
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // In a real integration, this fetches from your backend or Postpipe directly:
    // fetch(\`/api/rbac/bootstrap?key=\${publishableKey}\`).then(...)
    
    // MOCK DATA for demonstration:
    setTimeout(() => {
      setSchema([
        { action: 'event.create', resource: 'events', description: 'Create and schedule new events.' },
        { action: 'event.delete', resource: 'events', description: 'Delete existing events.' },
        { action: 'payment.refund', resource: 'payments', description: 'Issue refunds to customers.' },
        { action: 'team.invite', resource: 'team', description: 'Invite staff members to the workspace.' }
      ]);
      setRoles([
        { id: 'r1', name: 'Admin', description: 'Full access to the entire application.', permissions: ['event.create', 'event.delete', 'payment.refund', 'team.invite'], isSystemDefault: true },
        { id: 'r2', name: 'Event Manager', description: 'Can manage events but cannot handle payments.', permissions: ['event.create', 'event.delete'], isSystemDefault: false },
      ]);
      setSelectedRoleId('r2');
      setIsLoading(false);
    }, 800);
  }, [publishableKey]);

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const newRole: Role = {
      id: Math.random().toString(),
      name: newRoleName,
      description: newRoleDesc || 'Custom role',
      permissions: [],
      isSystemDefault: false,
    };
    setRoles([...roles, newRole]);
    setSelectedRoleId(newRole.id);
    setNewRoleName('');
    setNewRoleDesc('');
    
    // TODO: Send to backend
    // fetch('/api/rbac/roles', { method: 'POST', body: JSON.stringify(newRole) });
  };

  const handleTogglePermission = (roleId: string, action: string) => {
    setRoles(roles.map(r => {
      if (r.id !== roleId) return r;
      if (r.isSystemDefault) {
        alert("System default roles cannot be modified.");
        return r;
      }
      const hasPerm = r.permissions.includes(action);
      const newPerms = hasPerm ? r.permissions.filter(p => p !== action) : [...r.permissions, action];
      
      // TODO: Sync change to backend
      return { ...r, permissions: newPerms };
    }));
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-neutral-500 animate-pulse">Loading Role Manager...</div>;
  }

  const activeRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      {/* LEFT PANEL: Roles List */}
      <div className="md:col-span-1 flex flex-col gap-4 border-r pr-0 md:pr-6 border-neutral-200 dark:border-white/10">
        <div className="bg-neutral-50 dark:bg-white/[0.02] p-4 rounded-xl border border-neutral-200 dark:border-white/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Create New Role</h3>
          <form onSubmit={handleCreateRole} className="space-y-3">
            <Input 
              placeholder="Role Name (e.g. Moderator)" 
              value={newRoleName} onChange={e => setNewRoleName(e.target.value)} 
              className="h-9 text-xs" 
            />
            <Input 
              placeholder="Description" 
              value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} 
              className="h-9 text-xs" 
            />
            <Button type="submit" className="w-full h-9 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Role
            </Button>
          </form>
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1 mb-1">Existing Roles</h3>
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRoleId(r.id)}
              className={cn(
                "flex items-center justify-between text-left p-3 rounded-xl border transition-all",
                selectedRoleId === r.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent hover:bg-neutral-50 dark:hover:bg-white/5"
              )}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">{r.name}</span>
                  {r.isSystemDefault && <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">Default</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Permissions Matrix */}
      <div className="md:col-span-2 flex flex-col gap-4">
        {!activeRole ? (
          <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-xl h-full min-h-[300px]">
            <Shield className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-semibold text-muted-foreground">Select a role to view permissions</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between bg-neutral-100 dark:bg-white/[0.02] border rounded-xl p-4">
              <div>
                <h3 className="text-sm font-bold">Permissions for <span className="text-primary">{activeRole.name}</span></h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeRole.isSystemDefault ? "This role has full access and cannot be modified." : "Toggle the permissions this role is allowed to perform."}
                </p>
              </div>
              <Badge>{activeRole.permissions.length} Assigned</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schema.map(p => {
                const isChecked = activeRole.permissions.includes(p.action) || activeRole.isSystemDefault;
                return (
                  <div 
                    key={p.action}
                    onClick={() => handleTogglePermission(activeRole.id, p.action)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all hover:bg-neutral-50 dark:hover:bg-white/5",
                      isChecked ? "border-emerald-500/30 bg-emerald-500/5" : "border-neutral-200 dark:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "flex h-4.5 w-4.5 items-center justify-center rounded border mt-0.5 shrink-0 transition-all",
                      isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-neutral-300 dark:border-white/20"
                    )}>
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-mono font-bold">{p.action}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{p.resource}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{p.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
