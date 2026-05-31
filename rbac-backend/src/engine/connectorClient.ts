/**
 * Connector Client
 *
 * HTTP client for sending HMAC-signed RBAC operation requests
 * to the developer's connector runtime.
 */

import crypto from 'crypto';
import type { RBACOperation, SchemaMapping, ConnectorRBACResponse } from '../types';

interface ConnectorTarget {
  url: string;
  secret: string;
  databaseType: 'postgres' | 'mongodb' | 'mysql';
}

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RETRIES = 1;

/**
 * Resolve the actual table name from the schema mapping.
 */
function resolveTable(entity: string, schema: SchemaMapping): string {
  const tableMap: Record<string, string> = {
    user: schema.usersTable,
    role: schema.rolesTable,
    permission: schema.permissionsTable,
    userRole: schema.userRolesTable,
    rolePermission: schema.rolePermissionsTable,
  };
  return tableMap[entity] || entity;
}

/**
 * Execute an RBAC operation against the developer's connector.
 *
 * Sends a signed POST to `{connectorUrl}/postpipe/rbac/query`
 * with the operation payload.
 */
export async function executeRBACOperation(
  connector: ConnectorTarget,
  operation: RBACOperation,
  schema: SchemaMapping,
): Promise<ConnectorRBACResponse> {
  const table = resolveTable(operation.entity, schema);
  const timestamp = new Date().toISOString();

  const body = JSON.stringify({
    operation: {
      verb: operation.verb,
      table,
      filter: operation.filter,
      data: operation.data,
      options: operation.options,
    },
    databaseType: connector.databaseType,
    timestamp,
  });

  // HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', connector.secret)
    .update(body)
    .digest('hex');

  const url = `${connector.url}/postpipe/rbac/query`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-postpipe-signature': signature,
          'x-postpipe-timestamp': timestamp,
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text().catch(() => 'unknown error');
        console.error(`[ConnectorClient] ${url} returned ${res.status}: ${errText}`);
        return {
          success: false,
          error: `Connector returned status ${res.status}: ${errText}`,
        };
      }

      const data = await res.json();
      return data as ConnectorRBACResponse;
    } catch (err: any) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        console.warn(`[ConnectorClient] Retry ${attempt + 1} for ${url}`);
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  console.error(`[ConnectorClient] All retries failed for ${url}:`, lastError);
  return {
    success: false,
    error: `Failed to reach connector at ${connector.url}: ${lastError?.message || 'unknown error'}`,
  };
}
