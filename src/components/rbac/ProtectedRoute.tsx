"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/lib/rbac/RBACContext";

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wrap any page/component to gate it behind a permission check.
//
// Usage:
//   <ProtectedRoute action="manage" resource="team">
//     <TeamSettingsPage />
//   </ProtectedRoute>

interface ProtectedRouteProps {
  action: string;
  resource: string;
  redirectTo?: string;
  children: React.ReactNode;
}

export function ProtectedRoute({
  action,
  resource,
  redirectTo = "/unauthorized",
  children,
}: ProtectedRouteProps) {
  const { can, currentUser } = useRBAC();
  const router = useRouter();

  if (!currentUser) {
    router.replace("/login");
    return null;
  }

  if (!can(action, resource)) {
    router.replace(redirectTo);
    return null;
  }

  return <>{children}</>;
}

// ─── UnauthorizedPage ─────────────────────────────────────────────────────────
// Render this at /unauthorized

export function UnauthorizedPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="text-5xl">🔒</div>
      <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
      <p className="text-muted-foreground max-w-sm">
        You don't have permission to view this page. Contact your workspace admin
        if you think this is a mistake.
      </p>
      <button
        onClick={() => router.back()}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go back
      </button>
    </div>
  );
}