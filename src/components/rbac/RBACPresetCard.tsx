"use client";

import React, { useState } from "react";
import type { RBACConfig, Role } from "@/lib/rbac/types";
import { DEFAULT_RBAC_CONFIG } from "@/lib/rbac/permissions";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RBACPresetCardProps {
  value?: RBACConfig;
  onChange?: (config: RBACConfig) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RBACPresetCard({
  value = DEFAULT_RBAC_CONFIG,
  onChange,
}: RBACPresetCardProps) {
  const [config, setConfig] = useState<RBACConfig>(value);
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  function update(partial: Partial<RBACConfig>) {
    const next = { ...config, ...partial };
    setConfig(next);
    onChange?.(next);
  }

  function addCustomRole() {
    const label = newRoleLabel.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/\s+/g, "_");
    if (config.roles.find((r) => r.key === key)) return;
    const newRole: Role = {
      key,
      label,
      description: "Custom role",
      permissions: [{ action: "read", resource: "*" }],
      isCustom: true,
    };
    update({ roles: [...config.roles, newRole] });
    setNewRoleLabel("");
  }

  function removeRole(key: string) {
    update({ roles: config.roles.filter((r) => r.key !== key) });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Role-Based Access Control
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assign roles to team members and protect routes automatically.
          </p>
        </div>

        {/* Toggle */}
        <button
          role="switch"
          aria-checked={config.enabled}
          onClick={() => update({ enabled: !config.enabled })}
          className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            config.enabled ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              config.enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Roles list */}
      {config.enabled && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Roles
          </p>

          {config.roles.map((role) => (
            <div
              key={role.key}
              className="rounded-xl border border-border bg-background"
            >
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() =>
                  setExpandedRole(expandedRole === role.key ? null : role.key)
                }
              >
                <div className="flex items-center gap-3">
                  <RoleBadge roleKey={role.key} />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {role.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {role.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRole(role.key);
                      }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  )}
                  <ChevronIcon open={expandedRole === role.key} />
                </div>
              </button>

              {expandedRole === role.key && (
                <div className="border-t border-border px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Permissions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((p, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-mono text-foreground"
                      >
                        {p.action}:{p.resource}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add custom role */}
          <div className="flex gap-2 pt-1">
            <input
              value={newRoleLabel}
              onChange={(e) => setNewRoleLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomRole()}
              placeholder="New custom role name…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={addCustomRole}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Default role picker */}
          <div className="flex items-center gap-3 pt-1">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              Default role for new users
            </label>
            <select
              value={config.defaultRole}
              onChange={(e) => update({ defaultRole: e.target.value })}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {config.roles.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  owner:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  admin:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  editor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  viewer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

function RoleBadge({ roleKey }: { roleKey: string }) {
  const classes = ROLE_COLORS[roleKey] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${classes}`}>
      {roleKey}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}