import type { Role, RBACConfig } from "./types";

// ─── Default Role Definitions ──────────────────────────────────────────────────

export const DEFAULT_ROLES: Role[] = [
  {
    key: "owner",
    label: "Owner",
    description: "Full access to everything. Cannot be removed.",
    permissions: [
      { action: "*", resource: "*" }, // wildcard — all actions on all resources
    ],
  },
  {
    key: "admin",
    label: "Admin",
    description: "Manage team, connectors, forms, and settings.",
    permissions: [
      { action: "read",   resource: "*" },
      { action: "write",  resource: "*" },
      { action: "delete", resource: "form" },
      { action: "delete", resource: "connector" },
      { action: "manage", resource: "team" },
    ],
  },
  {
    key: "editor",
    label: "Editor",
    description: "Create and edit forms and connectors. Cannot manage team.",
    permissions: [
      { action: "read",   resource: "*" },
      { action: "write",  resource: "form" },
      { action: "write",  resource: "connector" },
      { action: "delete", resource: "form" },
    ],
  },
  {
    key: "viewer",
    label: "Viewer",
    description: "Read-only access to all resources.",
    permissions: [
      { action: "read", resource: "*" },
    ],
  },
];

export const DEFAULT_RBAC_CONFIG: RBACConfig = {
  enabled: false,
  roles: DEFAULT_ROLES,
  defaultRole: "viewer",
};

// ─── Permission Checker ────────────────────────────────────────────────────────

/**
 * Check whether a user's role grants a specific action on a resource.
 *
 * @example
 *   hasPermission(config, user, "delete", "form") // true / false
 */
export function hasPermission(
  config: RBACConfig,
  userRole: string,
  action: string,
  resource: string
): boolean {
  if (!config.enabled) return true; // RBAC disabled → allow everything

  const role = config.roles.find((r) => r.key === userRole);
  if (!role) return false;

  return role.permissions.some(
    (p) =>
      (p.action === "*" || p.action === action) &&
      (p.resource === "*" || p.resource === resource)
  );
}

/**
 * Returns all permission strings for a given role key, e.g. ["read:*", "write:form"]
 */
export function getRolePermissionStrings(
  config: RBACConfig,
  roleKey: string
): string[] {
  const role = config.roles.find((r) => r.key === roleKey);
  if (!role) return [];
  return role.permissions.map((p) => `${p.action}:${p.resource}`);
}