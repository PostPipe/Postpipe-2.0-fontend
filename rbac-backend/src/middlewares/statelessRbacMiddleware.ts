import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Note: In a real implementation, getConnectorConfig would fetch from PostPipe's metadata store
// import { getConnectorConfig } from '../lib/configDb'; 
// For now, we mock the config retrieval based on projectId
const mockGetConnectorConfig = async (projectId: string) => {
  return {
    id: projectId,
    usersTable: 'Users',
    rolesTable: 'Roles',
    permissionsTable: 'Permissions',
    jwtSecret: 'developer-provided-secret-for-' + projectId, // In reality, this comes from the DB
  };
};

export interface PostpipeRequest extends Request {
  connectorConfig?: any;
  user?: any;
}

/**
 * 1. Identify Connector & Load Config
 */
export const loadConnectorConfig = async (req: PostpipeRequest, res: Response, next: NextFunction) => {
  const projectId = req.headers['x-project-id'] as string;
  if (!projectId) {
    return res.status(400).json({ error: 'Missing x-project-id header' });
  }

  // const config = await getConnectorConfig(projectId);
  const config = await mockGetConnectorConfig(projectId);
  if (!config) {
    return res.status(404).json({ error: 'Project configuration not found' });
  }

  req.connectorConfig = config;
  next();
};

/**
 * 2. Stateless JWT Verification Middleware
 */
export const verifyStatelessJWT = (req: PostpipeRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Use the developer's specific JWT_SECRET from their configuration
  const secret = req.connectorConfig.jwtSecret;

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Attach decoded user (contains roles/permissions) to request
    req.user = decoded; 
    next();
  });
};

/**
 * 3. Role Checking Middleware
 */
export const requireRole = (requiredRole: string) => {
  return (req: PostpipeRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ error: 'No roles found in token' });
    }

    if (!req.user.roles.includes(requiredRole)) {
      return res.status(403).json({ error: `Forbidden: Requires ${requiredRole} role` });
    }

    next();
  };
};
