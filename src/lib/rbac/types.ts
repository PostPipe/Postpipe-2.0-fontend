// ─── RBAC Types ────────────────────────────────────────────────────────────────

export type RoleKey = "owner" | "admin" | "editor" | "viewer" | string;

export interface Permission {
  action: string;   // e.g. "read", "write", "delete"
  resource: string; // e.g. "form", "connector", "team"
}

export interface Role {
  key: RoleKey;
  label: string;
  description: string;
  permissions: Permission[];
  isCustom?: boolean;
}

export interface RBACUser {
  id: string;
  email: string;
  role: RoleKey;
}

export interface RBACConfig {
  enabled: boolean;
  roles: Role[];
  defaultRole: RoleKey;
}

export type PermissionCheck = (
  user: RBACUser | null,
  action: string,
  resource: string
) => boolean;