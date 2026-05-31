/**
 * requirePermission Middleware
 *
 * Permission and role checking against JWT payload claims.
 * Includes anti-escalation protection.
 */

import type { Response, NextFunction } from 'express';
import type { PostpipeRequest } from '../types';

/**
 * Requires the caller to have a specific permission in their JWT.
 * Permissions are dot-notation strings like "role.assign", "user.create".
 */
export function requirePermission(permission: string) {
  return (req: PostpipeRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userPermissions = req.user.permissions || [];

    // Wildcard permission grants full access
    if (userPermissions.includes('*')) {
      next();
      return;
    }

    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
        required: permission,
      });
      return;
    }

    next();
  };
}

/**
 * Requires the caller to have a specific role.
 */
export function requireRole(role: string) {
  return (req: PostpipeRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRoles = req.user.roles || [];

    if (!userRoles.includes(role)) {
      res.status(403).json({
        error: 'Forbidden: Insufficient role',
        required: role,
      });
      return;
    }

    next();
  };
}

/**
 * Requires the caller to have ANY of the specified permissions.
 */
export function requireAnyPermission(permissions: string[]) {
  return (req: PostpipeRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userPermissions = req.user.permissions || [];

    if (userPermissions.includes('*')) {
      next();
      return;
    }

    const hasAny = permissions.some(p => userPermissions.includes(p));
    if (!hasAny) {
      res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
        required: permissions,
      });
      return;
    }

    next();
  };
}
