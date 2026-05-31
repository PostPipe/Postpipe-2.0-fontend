/**
 * Audit Logger (Stateless)
 *
 * PostPipe NEVER persists audit data locally.
 * Logs are:
 *  1. Written to the developer's DB via connector (if configured)
 *  2. Dispatched as webhooks (if configured)
 *  3. Emitted to structured console logs (always)
 */

import type { RBACProjectConfig } from '../types';
import { executeRBACOperation } from './connectorClient';

export interface AuditEntry {
  action: string;        // e.g. "user.login", "role.assign"
  actorId: string;       // user_id of the person performing the action
  targetType: string;    // "user", "role", "permission"
  targetId: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  timestamp: string;
}

/**
 * Log an RBAC action. This is fire-and-forget — it should never
 * block the main request flow.
 */
export async function logAuditEvent(
  config: RBACProjectConfig,
  entry: AuditEntry
): Promise<void> {
  // 1. Always emit structured console log
  console.log(
    `[RBAC Audit] project=${config.projectId} action=${entry.action} ` +
    `actor=${entry.actorId} target=${entry.targetType}:${entry.targetId || 'n/a'} ` +
    `ip=${entry.ip || 'unknown'}`
  );

  // 2. Optionally write to developer's DB via connector
  // This is fire-and-forget — errors are logged but don't fail the request
  try {
    if (config.connectorUrl && config.connectorSecret) {
      await executeRBACOperation(
        {
          url: config.connectorUrl,
          secret: config.connectorSecret,
          databaseType: config.databaseType,
        },
        {
          verb: 'insertOne',
          entity: 'permission', // We reuse a generic entity — the table is resolved below
          data: {
            action: entry.action,
            actorId: entry.actorId,
            targetType: entry.targetType,
            targetId: entry.targetId || null,
            metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
            ip: entry.ip || null,
            timestamp: entry.timestamp,
          },
        },
        {
          ...config.schema,
          // Override — audit logs go to a dedicated table if the dev has one
          permissionsTable: 'audit_logs',
        },
      );
    }
  } catch (err) {
    // Never let audit logging fail the main request
    console.warn('[AuditLogger] Failed to write audit log to connector:', err);
  }
}
