/**
 * PostPipe Stateless RBAC — Core Type Definitions
 *
 * PostPipe NEVER stores end-user data. These types define the
 * metadata PostPipe keeps about a developer's RBAC project
 * (connector binding, schema mapping, encrypted JWT secret)
 * and the wire formats used at runtime.
 */

import type { Request, Response, NextFunction } from 'express';

// ─── Schema Mapping ─────────────────────────────────────────────────────────

/** Maps the developer's custom table/collection and field names. */
export interface SchemaMapping {
  usersTable: string;
  rolesTable: string;
  permissionsTable: string;
  userRolesTable: string;
  rolePermissionsTable: string;
  fields: {
    userId: string;         // PK field in users table
    email: string;          // email field
    passwordHash: string;   // hashed password field
    roleName: string;       // name field in roles table
    roleId: string;         // PK field in roles table
    permissionAction: string; // action field in permissions table
    permissionId: string;   // PK field in permissions table
  };
}

// ─── JWT Configuration ──────────────────────────────────────────────────────

export interface JWTConfig {
  encryptedSecret: string;      // AES-256-GCM encrypted
  accessTokenExpiry: string;    // e.g. "15m", "1h", "24h"
  refreshTokenExpiry: string;   // e.g. "7d", "30d"
  hashingRounds: number;        // bcrypt rounds (10–14)
}

// ─── Project Configuration ──────────────────────────────────────────────────

/**
 * Per-project RBAC configuration stored in PostPipe's metadata DB.
 * This is NOT end-user data — it describes how to connect to the
 * developer's database and verify their users' JWTs.
 */
export interface RBACProjectConfig {
  projectId: string;
  connectorId: string;
  connectorUrl: string;
  connectorSecret: string;
  databaseType: 'postgres' | 'mongodb' | 'mysql';
  schema: SchemaMapping;
  jwt: JWTConfig;
  /** Decrypted JWT secret — populated at runtime, never persisted in plaintext. */
  _decryptedJWTSecret?: string;
}

// ─── JWT Payload ────────────────────────────────────────────────────────────

/** Standardised JWT claims embedded in every access token. */
export interface JWTPayload {
  user_id: string;
  email: string;
  roles: string[];
  permissions: string[];
  org_id?: string;
  project_id: string;
  token_version: number;
  iat?: number;
  exp?: number;
}

// ─── RBAC Operations ────────────────────────────────────────────────────────

/**
 * Normalised internal operation format.
 * The query translator converts this into database-specific payloads.
 */
export type RBACOperationVerb =
  | 'findOne'
  | 'findMany'
  | 'insertOne'
  | 'updateOne'
  | 'deleteOne';

export type RBACEntity =
  | 'user'
  | 'role'
  | 'permission'
  | 'userRole'
  | 'rolePermission';

export interface RBACOperation {
  verb: RBACOperationVerb;
  entity: RBACEntity;
  filter?: Record<string, unknown>;
  data?: Record<string, unknown>;
  options?: {
    limit?: number;
    offset?: number;
    select?: string[];
  };
}

// ─── Connector Wire Format ──────────────────────────────────────────────────

/** Request payload sent FROM PostPipe TO the developer's connector. */
export interface ConnectorRBACRequest {
  operation: RBACOperation;
  schemaMapping: SchemaMapping;
  databaseType: 'postgres' | 'mongodb' | 'mysql';
  timestamp: string;
  signature: string;
}

/** Response payload sent FROM the connector BACK to PostPipe. */
export interface ConnectorRBACResponse {
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
}

// ─── Extended Express Request ───────────────────────────────────────────────

export interface PostpipeRequest extends Request {
  /** Project RBAC configuration (loaded by connectorResolver). */
  projectConfig?: RBACProjectConfig;
  /** Decoded JWT user payload (populated by verifyJWT). */
  user?: JWTPayload;
  /** Resolved connector details. */
  connector?: {
    url: string;
    secret: string;
    databaseType: 'postgres' | 'mongodb' | 'mysql';
  };
}

// ─── Middleware Type Helper ─────────────────────────────────────────────────

export type PostpipeMiddleware = (
  req: PostpipeRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
