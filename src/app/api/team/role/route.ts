// src/app/api/team/role/route.ts
// PATCH /api/team/role  { userId, role }

import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_RBAC_CONFIG, hasPermission } from "@/lib/rbac/permissions";

export async function PATCH(req: NextRequest) {
  // 1. Auth — get the requesting user's role from your session store
  const requestingRole = await getRequestingUserRole(req);
  if (!requestingRole) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // 2. Permission check — only admins/owners can manage team
  if (!hasPermission(DEFAULT_RBAC_CONFIG, requestingRole, "manage", "team")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Parse body
  const body = await req.json();
  const { userId, role } = body as { userId?: string; role?: string };

  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
  }

  // Guard: cannot assign/promote to owner via API
  if (role === "owner") {
    return NextResponse.json({ error: "Cannot assign owner role via API" }, { status: 400 });
  }

  // 4. Validate role exists in config
  const validRole = DEFAULT_RBAC_CONFIG.roles.find((r) => r.key === role);
  if (!validRole) {
    return NextResponse.json({ error: `Unknown role: ${role}` }, { status: 400 });
  }

  // 5. Persist to DB — replace with your DB call
  // await db.users.update({ where: { id: userId }, data: { role } });

  return NextResponse.json({ success: true, userId, role });
}

// ─── Stub: replace with real session lookup ───────────────────────────────────
async function getRequestingUserRole(req: NextRequest): Promise<string | null> {
  const session = req.cookies.get("postpipe_session")?.value;
  if (!session) return null;
  try {
    const parsed = JSON.parse(atob(session));
    return parsed?.role ?? null;
  } catch {
    return null;
  }
}