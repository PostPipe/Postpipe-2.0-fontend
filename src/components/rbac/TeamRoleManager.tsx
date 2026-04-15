"use client";

import React, { useState } from "react";
import type { RBACConfig, RBACUser } from "@/lib/rbac/types";
import { Can } from "@/lib/rbac/RBACContext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TeamRoleManagerProps {
  config: RBACConfig;
  members: RBACUser[];
  onRoleChange?: (userId: string, newRole: string) => Promise<void>;
  onRemoveMember?: (userId: string) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeamRoleManager({
  config,
  members,
  onRoleChange,
  onRemoveMember,
}: TeamRoleManagerProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleRoleChange(userId: string, role: string) {
    setLoadingId(userId);
    try {
      await onRoleChange?.(userId, role);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm("Remove this team member?")) return;
    setLoadingId(userId);
    try {
      await onRemoveMember?.(userId);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_160px_120px] gap-4 px-5 py-3 bg-muted/40 border-b border-border">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Member
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Role
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
          Actions
        </span>
      </div>

      {/* Rows */}
      {members.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No team members yet.
        </p>
      ) : (
        members.map((member) => (
          <div
            key={member.id}
            className="grid grid-cols-[1fr_160px_120px] gap-4 items-center px-5 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
          >
            {/* Email */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar email={member.email} />
              <span className="text-sm text-foreground truncate">{member.email}</span>
            </div>

            {/* Role selector */}
            <Can action="manage" resource="team" fallback={
              <RolePill role={member.role} />
            }>
              <select
                disabled={loadingId === member.id || member.role === "owner"}
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {config.roles.map((r) => (
                  <option key={r.key} value={r.key} disabled={r.key === "owner"}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Can>

            {/* Remove */}
            <div className="flex justify-end">
              <Can action="manage" resource="team">
                {member.role !== "owner" && (
                  <button
                    disabled={loadingId === member.id}
                    onClick={() => handleRemove(member.id)}
                    className="text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    {loadingId === member.id ? "…" : "Remove"}
                  </button>
                )}
              </Can>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  const hue = [...email].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ background: `hsl(${hue},60%,50%)` }}
    >
      {initials}
    </span>
  );
}

const ROLE_PILL_COLORS: Record<string, string> = {
  owner:  "bg-yellow-100 text-yellow-800",
  admin:  "bg-red-100 text-red-800",
  editor: "bg-blue-100 text-blue-800",
  viewer: "bg-green-100 text-green-800",
};

function RolePill({ role }: { role: string }) {
  const classes = ROLE_PILL_COLORS[role] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${classes}`}>
      {role}
    </span>
  );
}