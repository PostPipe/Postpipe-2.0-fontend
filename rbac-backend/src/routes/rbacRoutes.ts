/**
 * PostPipe Stateless RBAC Routes
 *
 * Every endpoint routes operations through the developer's connector
 * to their own database. PostPipe NEVER stores end-user data.
 *
 * Public endpoints (login, refresh) use loadProjectConfig.
 * Protected endpoints use verifyJWT.
 * All endpoints use connectorResolver to dispatch.
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import type { PostpipeRequest, JWTPayload, RBACOperation } from '../types';
import { verifyJWT, loadProjectConfig } from '../middleware/verifyJWT';
import { requirePermission } from '../middleware/requirePermission';
import { connectorResolver } from '../middleware/connectorResolver';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { executeRBACOperation } from '../engine/connectorClient';
import { formatSuccess, formatError } from '../engine/responseFormatter';
import { logAuditEvent } from '../engine/auditLogger';

const router = express.Router();

// ─── Helper ─────────────────────────────────────────────────────────────────

function getConnectorTarget(req: PostpipeRequest) {
  return {
    url: req.connector!.url,
    secret: req.connector!.secret,
    databaseType: req.connector!.databaseType,
  };
}

function getSchema(req: PostpipeRequest) {
  return req.projectConfig!.schema;
}

// ─── PUBLIC: Login ──────────────────────────────────────────────────────────

router.post(
  '/login',
  loginRateLimiter as express.RequestHandler,
  loadProjectConfig as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json(formatError('Email and password are required'));
      return;
    }

    const connector = getConnectorTarget(req);
    const schema = getSchema(req);
    const config = req.projectConfig!;

    try {
      // 1. Query user from developer's DB
      const userResult = await executeRBACOperation(connector, {
        verb: 'findOne',
        entity: 'user',
        filter: { email },
      }, schema);

      if (!userResult.success || !userResult.data) {
        res.status(401).json(formatError('Invalid credentials'));
        return;
      }

      const user = userResult.data;
      const hashField = schema.fields.passwordHash;
      const userIdField = schema.fields.userId;
      const emailField = schema.fields.email;

      // 2. Verify password hash — PostPipe discards plaintext immediately after
      const match = await bcrypt.compare(password, user[hashField]);
      if (!match) {
        res.status(401).json(formatError('Invalid credentials'));
        return;
      }

      // 3. Fetch user's roles from junction table
      const rolesResult = await executeRBACOperation(connector, {
        verb: 'findMany',
        entity: 'userRole',
        filter: { userId: user[userIdField] },
      }, schema);

      const roleNames: string[] = [];
      const allPermissions: string[] = [];

      if (rolesResult.success && Array.isArray(rolesResult.data)) {
        for (const ur of rolesResult.data) {
          const roleId = ur[schema.fields.roleId];
          // Fetch role details
          const roleResult = await executeRBACOperation(connector, {
            verb: 'findOne',
            entity: 'role',
            filter: { [schema.fields.roleId]: roleId },
          }, schema);

          if (roleResult.success && roleResult.data) {
            roleNames.push(roleResult.data[schema.fields.roleName]);

            // Fetch role's permissions
            const permResult = await executeRBACOperation(connector, {
              verb: 'findMany',
              entity: 'rolePermission',
              filter: { [schema.fields.roleId]: roleId },
            }, schema);

            if (permResult.success && Array.isArray(permResult.data)) {
              for (const rp of permResult.data) {
                const permId = rp[schema.fields.permissionId];
                const permDetail = await executeRBACOperation(connector, {
                  verb: 'findOne',
                  entity: 'permission',
                  filter: { [schema.fields.permissionId]: permId },
                }, schema);
                if (permDetail.success && permDetail.data) {
                  allPermissions.push(permDetail.data[schema.fields.permissionAction]);
                }
              }
            }
          }
        }
      }

      // 4. Generate JWT with developer's secret
      const secret = config._decryptedJWTSecret;
      if (!secret) {
        res.status(500).json(formatError('JWT secret not configured'));
        return;
      }

      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        user_id: user[userIdField],
        email: user[emailField],
        roles: roleNames,
        permissions: [...new Set(allPermissions)],
        project_id: config.projectId,
        token_version: user.token_version || 0,
      };

      const accessToken = jwt.sign(payload, secret, {
        expiresIn: (config.jwt.accessTokenExpiry || '1h') as any,
      });

      const refreshToken = jwt.sign(
        { user_id: user[userIdField], project_id: config.projectId, type: 'refresh' },
        secret,
        { expiresIn: (config.jwt.refreshTokenExpiry || '7d') as any }
      );

      // 5. Audit log (fire-and-forget)
      logAuditEvent(config, {
        action: 'user.login',
        actorId: user[userIdField],
        targetType: 'user',
        targetId: user[userIdField],
        ip: req.ip || 'unknown',
        timestamp: new Date().toISOString(),
      });

      res.json(formatSuccess({
        accessToken,
        refreshToken,
        user: {
          id: user[userIdField],
          email: user[emailField],
          roles: roleNames,
          permissions: [...new Set(allPermissions)],
        },
      }));
    } catch (err: any) {
      console.error('[Login] Error:', err);
      res.status(500).json(formatError('Login failed'));
    }
  }
);

// ─── PUBLIC: Refresh Token ──────────────────────────────────────────────────

router.post(
  '/refresh',
  loadProjectConfig as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json(formatError('Refresh token required'));
      return;
    }

    const config = req.projectConfig!;
    const secret = config._decryptedJWTSecret;
    if (!secret) {
      res.status(500).json(formatError('JWT secret not configured'));
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, secret) as any;
      if (decoded.type !== 'refresh') {
        res.status(403).json(formatError('Invalid refresh token'));
        return;
      }

      // Re-fetch user to get latest roles/permissions
      const connector = getConnectorTarget(req);
      const schema = getSchema(req);

      const userResult = await executeRBACOperation(connector, {
        verb: 'findOne',
        entity: 'user',
        filter: { [schema.fields.userId]: decoded.user_id },
      }, schema);

      if (!userResult.success || !userResult.data) {
        res.status(401).json(formatError('User not found'));
        return;
      }

      const user = userResult.data;

      // Simplified — reissue tokens with fresh data
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        user_id: user[schema.fields.userId],
        email: user[schema.fields.email],
        roles: [], // Re-resolve from DB in production
        permissions: [],
        project_id: config.projectId,
        token_version: user.token_version || 0,
      };

      const newAccessToken = jwt.sign(payload, secret, {
        expiresIn: (config.jwt.accessTokenExpiry || '1h') as any,
      });

      const newRefreshToken = jwt.sign(
        { user_id: decoded.user_id, project_id: config.projectId, type: 'refresh' },
        secret,
        { expiresIn: (config.jwt.refreshTokenExpiry || '7d') as any }
      );

      res.json(formatSuccess({ accessToken: newAccessToken, refreshToken: newRefreshToken }));
    } catch {
      res.status(403).json(formatError('Invalid or expired refresh token'));
    }
  }
);

// ─── PROTECTED: Get Current User ────────────────────────────────────────────

router.get(
  '/me',
  verifyJWT as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'findOne',
      entity: 'user',
      filter: { [schema.fields.userId]: req.user!.user_id },
    }, schema);

    if (!result.success || !result.data) {
      res.status(404).json(formatError('User not found'));
      return;
    }

    // Strip password hash before returning
    const user = { ...result.data };
    delete user[schema.fields.passwordHash];

    res.json(formatSuccess({
      ...user,
      roles: req.user!.roles,
      permissions: req.user!.permissions,
    }));
  }
);

// ─── PROTECTED: Logout (increment token_version) ───────────────────────────

router.post(
  '/logout',
  verifyJWT as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    // Increment token_version in the developer's DB to invalidate all existing JWTs
    await executeRBACOperation(connector, {
      verb: 'updateOne',
      entity: 'user',
      filter: { [schema.fields.userId]: req.user!.user_id },
      data: { token_version: (req.user!.token_version || 0) + 1 },
    }, schema);

    logAuditEvent(req.projectConfig!, {
      action: 'user.logout',
      actorId: req.user!.user_id,
      targetType: 'user',
      targetId: req.user!.user_id,
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.json(formatSuccess({ message: 'Logged out successfully' }));
  }
);

// ─── PROTECTED: List Users ──────────────────────────────────────────────────

router.get(
  '/users',
  verifyJWT as express.RequestHandler,
  requirePermission('user.list') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const connector = getConnectorTarget(req);
    const schema = getSchema(req);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await executeRBACOperation(connector, {
      verb: 'findMany',
      entity: 'user',
      options: { limit, offset },
    }, schema);

    if (!result.success) {
      res.status(500).json(formatError(result.error || 'Failed to fetch users'));
      return;
    }

    res.json(formatSuccess(result.data, result.count));
  }
);

// ─── PROTECTED: Create User ─────────────────────────────────────────────────

router.post(
  '/users',
  verifyJWT as express.RequestHandler,
  requirePermission('user.create') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const { email, password, ...extraFields } = req.body;
    if (!email || !password) {
      res.status(400).json(formatError('Email and password are required'));
      return;
    }

    const connector = getConnectorTarget(req);
    const schema = getSchema(req);
    const config = req.projectConfig!;

    // Hash password — PostPipe discards plaintext immediately
    const rounds = config.jwt.hashingRounds || 12;
    const hashedPassword = await bcrypt.hash(password, rounds);

    const result = await executeRBACOperation(connector, {
      verb: 'insertOne',
      entity: 'user',
      data: {
        email,
        passwordHash: hashedPassword,
        token_version: 0,
        ...extraFields,
      },
    }, schema);

    if (!result.success) {
      res.status(400).json(formatError(result.error || 'Failed to create user'));
      return;
    }

    logAuditEvent(config, {
      action: 'user.create',
      actorId: req.user!.user_id,
      targetType: 'user',
      targetId: (result.data?.id || 'unknown') as string,
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(formatSuccess(result.data));
  }
);

// ─── PROTECTED: Delete User ─────────────────────────────────────────────────

router.delete(
  '/users/:id',
  verifyJWT as express.RequestHandler,
  requirePermission('user.delete') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'deleteOne',
      entity: 'user',
      filter: { [schema.fields.userId]: req.params.id },
    }, schema);

    if (!result.success) {
      res.status(400).json(formatError(result.error || 'Failed to delete user'));
      return;
    }

    logAuditEvent(req.projectConfig!, {
      action: 'user.delete',
      actorId: req.user!.user_id,
      targetType: 'user',
      targetId: req.params.id as string,
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.json(formatSuccess({ message: 'User deleted' }));
  }
);

// ─── PROTECTED: List Roles ──────────────────────────────────────────────────

router.get(
  '/roles',
  verifyJWT as express.RequestHandler,
  requirePermission('role.list') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'findMany',
      entity: 'role',
    }, schema);

    if (!result.success) {
      res.status(500).json(formatError(result.error || 'Failed to fetch roles'));
      return;
    }

    res.json(formatSuccess(result.data, result.count));
  }
);

// ─── PROTECTED: Create Role ─────────────────────────────────────────────────

router.post(
  '/roles',
  verifyJWT as express.RequestHandler,
  requirePermission('role.create') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json(formatError('Role name is required'));
      return;
    }

    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'insertOne',
      entity: 'role',
      data: { roleName: name, description: description || '' },
    }, schema);

    if (!result.success) {
      res.status(400).json(formatError(result.error || 'Failed to create role'));
      return;
    }

    logAuditEvent(req.projectConfig!, {
      action: 'role.create',
      actorId: req.user!.user_id,
      targetType: 'role',
      targetId: (result.data?.id || name) as string,
      metadata: { name },
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(formatSuccess(result.data));
  }
);

// ─── PROTECTED: Delete Role ─────────────────────────────────────────────────

router.delete(
  '/roles/:id',
  verifyJWT as express.RequestHandler,
  requirePermission('role.delete') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'deleteOne',
      entity: 'role',
      filter: { [schema.fields.roleId]: req.params.id },
    }, schema);

    if (!result.success) {
      res.status(400).json(formatError(result.error || 'Failed to delete role'));
      return;
    }

    logAuditEvent(req.projectConfig!, {
      action: 'role.delete',
      actorId: req.user!.user_id,
      targetType: 'role',
      targetId: req.params.id as string,
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.json(formatSuccess({ message: 'Role deleted' }));
  }
);

// ─── PROTECTED: Assign Role ─────────────────────────────────────────────────

router.post(
  '/assign-role',
  verifyJWT as express.RequestHandler,
  requirePermission('role.assign') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const { userId, roleId } = req.body;
    if (!userId || !roleId) {
      res.status(400).json(formatError('userId and roleId are required'));
      return;
    }

    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'insertOne',
      entity: 'userRole',
      data: { userId, roleId },
    }, schema);

    if (!result.success) {
      res.status(400).json(formatError(result.error || 'Failed to assign role'));
      return;
    }

    logAuditEvent(req.projectConfig!, {
      action: 'role.assign',
      actorId: req.user!.user_id,
      targetType: 'userRole',
      targetId: `${userId}:${roleId}`,
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.json(formatSuccess({ message: 'Role assigned successfully' }));
  }
);

// ─── PROTECTED: Revoke Role ─────────────────────────────────────────────────

router.post(
  '/revoke-role',
  verifyJWT as express.RequestHandler,
  requirePermission('role.revoke') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const { userId, roleId } = req.body;
    if (!userId || !roleId) {
      res.status(400).json(formatError('userId and roleId are required'));
      return;
    }

    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'deleteOne',
      entity: 'userRole',
      filter: { userId, roleId },
    }, schema);

    if (!result.success) {
      res.status(400).json(formatError(result.error || 'Failed to revoke role'));
      return;
    }

    logAuditEvent(req.projectConfig!, {
      action: 'role.revoke',
      actorId: req.user!.user_id,
      targetType: 'userRole',
      targetId: `${userId}:${roleId}`,
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.json(formatSuccess({ message: 'Role revoked successfully' }));
  }
);

// ─── PROTECTED: List Permissions ────────────────────────────────────────────

router.get(
  '/permissions',
  verifyJWT as express.RequestHandler,
  requirePermission('permission.list') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'findMany',
      entity: 'permission',
    }, schema);

    if (!result.success) {
      res.status(500).json(formatError(result.error || 'Failed to fetch permissions'));
      return;
    }

    res.json(formatSuccess(result.data, result.count));
  }
);

// ─── PROTECTED: Create Permission ───────────────────────────────────────────

router.post(
  '/permissions',
  verifyJWT as express.RequestHandler,
  requirePermission('permission.create') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const { action, description } = req.body;
    if (!action) {
      res.status(400).json(formatError('Permission action is required'));
      return;
    }

    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'insertOne',
      entity: 'permission',
      data: { permissionAction: action, description: description || '' },
    }, schema);

    if (!result.success) {
      res.status(400).json(formatError(result.error || 'Failed to create permission'));
      return;
    }

    logAuditEvent(req.projectConfig!, {
      action: 'permission.create',
      actorId: req.user!.user_id,
      targetType: 'permission',
      targetId: action,
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(formatSuccess(result.data));
  }
);

// ─── PROTECTED: Update Permission ───────────────────────────────────────────

router.put(
  '/permissions/:id',
  verifyJWT as express.RequestHandler,
  requirePermission('permission.update') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const { action, description } = req.body;
    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const data: Record<string, unknown> = {};
    if (action) data.permissionAction = action;
    if (description !== undefined) data.description = description;

    const result = await executeRBACOperation(connector, {
      verb: 'updateOne',
      entity: 'permission',
      filter: { [schema.fields.permissionId]: req.params.id },
      data,
    }, schema);

    if (!result.success) {
      res.status(400).json(formatError(result.error || 'Failed to update permission'));
      return;
    }

    res.json(formatSuccess(result.data));
  }
);

// ─── PROTECTED: Delete Permission ───────────────────────────────────────────

router.delete(
  '/permissions/:id',
  verifyJWT as express.RequestHandler,
  requirePermission('permission.delete') as express.RequestHandler,
  connectorResolver as express.RequestHandler,
  async (req: PostpipeRequest, res: Response) => {
    const connector = getConnectorTarget(req);
    const schema = getSchema(req);

    const result = await executeRBACOperation(connector, {
      verb: 'deleteOne',
      entity: 'permission',
      filter: { [schema.fields.permissionId]: req.params.id },
    }, schema);

    if (!result.success) {
      res.status(400).json(formatError(result.error || 'Failed to delete permission'));
      return;
    }

    logAuditEvent(req.projectConfig!, {
      action: 'permission.delete',
      actorId: req.user!.user_id,
      targetType: 'permission',
      targetId: req.params.id as string,
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.json(formatSuccess({ message: 'Permission deleted' }));
  }
);

export default router;
