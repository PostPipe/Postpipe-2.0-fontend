// static-system/rbac-preset.ts
// Drop this in your static-system/ folder alongside other presets.

import type { RBACConfig } from "@/lib/rbac/types";
import { DEFAULT_ROLES } from "@/lib/rbac/permissions";

// ─── Preset Definition ────────────────────────────────────────────────────────

export interface StaticPreset {
  id: string;
  label: string;
  category: "auth" | "data" | "ui" | "infra";
  description: string;
  docsUrl?: string;
  defaultConfig: Record<string, unknown>;
  onEnable?: (projectConfig: Record<string, unknown>) => Record<string, unknown>;
}

export const rbacPreset: StaticPreset = {
  id: "rbac",
  label: "Role-Based Access Control",
  category: "auth",
  description:
    "Add Owner / Admin / Editor / Viewer roles to your project with auto-generated schema, middleware, and UI guards.",
  docsUrl: "/docs/presets/rbac",
  defaultConfig: {
    enabled: true,
    roles: DEFAULT_ROLES,
    defaultRole: "viewer",
  } satisfies RBACConfig,

  // Called when the user clicks "Enable" in the Forge/preset panel
  onEnable(projectConfig) {
    return {
      ...projectConfig,
      rbac: {
        enabled: true,
        roles: DEFAULT_ROLES,
        defaultRole: "viewer",
      },
      // Automatically add protected routes flag so template generator picks it up
      features: [
        ...((projectConfig.features as string[]) ?? []),
        "protected-routes",
        "role-aware-ui",
      ],
    };
  },
};

export default rbacPreset;