"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { RBACConfig, RBACUser } from "@/lib/rbac/types";
import { hasPermission, DEFAULT_RBAC_CONFIG } from "@/lib/rbac/permissions";

// ─── Context ───────────────────────────────────────────────────────────────────

interface RBACContextValue {
  config: RBACConfig;
  currentUser: RBACUser | null;
  can: (action: string, resource: string) => boolean;
  is: (role: string) => boolean;
}

const RBACContext = createContext<RBACContextValue>({
  config: DEFAULT_RBAC_CONFIG,
  currentUser: null,
  can: () => true,
  is: () => false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

interface RBACProviderProps {
  config?: RBACConfig;
  currentUser: RBACUser | null;
  children: React.ReactNode;
}

export function RBACProvider({
  config = DEFAULT_RBAC_CONFIG,
  currentUser,
  children,
}: RBACProviderProps) {
  const value = useMemo<RBACContextValue>(
    () => ({
      config,
      currentUser,
      can: (action, resource) =>
        currentUser
          ? hasPermission(config, currentUser.role, action, resource)
          : false,
      is: (role) => currentUser?.role === role,
    }),
    [config, currentUser]
  );

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRBAC() {
  return useContext(RBACContext);
}

// ─── Guard Component ──────────────────────────────────────────────────────────
// Usage:
//   <Can action="delete" resource="form">
//     <DeleteButton />
//   </Can>

interface CanProps {
  action: string;
  resource: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ action, resource, fallback = null, children }: CanProps) {
  const { can } = useRBAC();
  return can(action, resource) ? <>{children}</> : <>{fallback}</>;
}