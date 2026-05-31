/**
 * Query Translator
 *
 * Translates normalised RBACOperation objects into connector-specific
 * wire format payloads. Applies schema mapping for custom table/field names.
 */

import type { RBACOperation, RBACEntity, SchemaMapping, ConnectorRBACRequest } from '../types';
import crypto from 'crypto';

/**
 * Resolve the actual table name from the schema mapping.
 */
function resolveTable(entity: RBACEntity, schema: SchemaMapping): string {
  const tableMap: Record<RBACEntity, string> = {
    user: schema.usersTable,
    role: schema.rolesTable,
    permission: schema.permissionsTable,
    userRole: schema.userRolesTable,
    rolePermission: schema.rolePermissionsTable,
  };
  return tableMap[entity];
}

/**
 * Resolve field names through the schema mapping.
 * Replaces canonical field names (e.g. "email") with the developer's
 * custom field names (e.g. "user_email").
 */
function resolveFields(
  data: Record<string, unknown> | undefined,
  entity: RBACEntity,
  schema: SchemaMapping
): Record<string, unknown> | undefined {
  if (!data) return data;

  const resolved: Record<string, unknown> = {};
  const fieldMap = schema.fields;

  for (const [key, value] of Object.entries(data)) {
    // Try to map canonical field names to schema-specific names
    const mappedKey =
      key === 'userId' ? fieldMap.userId :
      key === 'email' ? fieldMap.email :
      key === 'passwordHash' ? fieldMap.passwordHash :
      key === 'roleName' ? fieldMap.roleName :
      key === 'roleId' ? fieldMap.roleId :
      key === 'permissionAction' ? fieldMap.permissionAction :
      key === 'permissionId' ? fieldMap.permissionId :
      key; // Unmapped fields pass through

    resolved[mappedKey] = value;
  }

  return resolved;
}

/**
 * Build a signed ConnectorRBACRequest ready to send to the connector.
 */
export function translateOperation(
  operation: RBACOperation,
  schema: SchemaMapping,
  databaseType: 'postgres' | 'mongodb' | 'mysql',
  connectorSecret: string
): ConnectorRBACRequest {
  // Resolve table and field names
  const resolvedOperation: RBACOperation = {
    ...operation,
  };
  if (operation.filter) {
    resolvedOperation.filter = resolveFields(operation.filter, operation.entity, schema) as Record<string, unknown>;
  }
  if (operation.data) {
    resolvedOperation.data = resolveFields(operation.data, operation.entity, schema) as Record<string, unknown>;
  }

  const timestamp = new Date().toISOString();
  const payload = JSON.stringify({
    operation: resolvedOperation,
    table: resolveTable(operation.entity, schema),
    timestamp,
  });

  // HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', connectorSecret)
    .update(payload)
    .digest('hex');

  return {
    operation: resolvedOperation,
    schemaMapping: schema,
    databaseType,
    timestamp,
    signature,
  };
}

/**
 * Build a translated operation with table name resolved.
 * Returns the payload object and resolved table for connector dispatch.
 */
export function buildConnectorPayload(
  operation: RBACOperation,
  schema: SchemaMapping,
  databaseType: 'postgres' | 'mongodb' | 'mysql',
  connectorSecret: string
): { table: string; payload: ConnectorRBACRequest } {
  const table = resolveTable(operation.entity, schema);
  const translated = translateOperation(operation, schema, databaseType, connectorSecret);

  return { table, payload: translated };
}
