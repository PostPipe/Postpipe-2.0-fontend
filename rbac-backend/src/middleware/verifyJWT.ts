/**
 * verifyJWT Middleware
 *
 * Stateless JWT verification using the DEVELOPER's per-project secret.
 * No session table lookup — purely cryptographic verification.
 */

import jwt from 'jsonwebtoken';
import type { Response, NextFunction } from 'express';
import type { PostpipeRequest, JWTPayload } from '../types';
import { getProjectConfig } from '../config/projectConfigService';

/**
 * Extracts x-project-id, loads the project's JWT secret,
 * and verifies the Bearer token. Attaches decoded user to req.user.
 */
export const verifyJWT = async (
  req: PostpipeRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. Extract project ID
  const projectId = req.headers['x-project-id'] as string;
  if (!projectId) {
    res.status(400).json({ error: 'Missing x-project-id header' });
    return;
  }

  // 2. Extract Bearer token
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Access token required (Bearer <token>)' });
    return;
  }

  // 3. Load project config (cached, 5-min TTL)
  const config = await getProjectConfig(projectId);
  if (!config) {
    res.status(404).json({ error: 'Project configuration not found' });
    return;
  }

  const secret = config._decryptedJWTSecret;
  if (!secret) {
    res.status(500).json({ error: 'JWT secret not configured for this project' });
    return;
  }

  // 4. Verify token — purely cryptographic, no DB lookup
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    req.projectConfig = config;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(403).json({ error: 'Invalid token' });
    }
  }
};

/**
 * Lighter middleware that only loads the project config without
 * requiring a JWT. Used for public endpoints like /login.
 */
export const loadProjectConfig = async (
  req: PostpipeRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const projectId = req.headers['x-project-id'] as string;
  if (!projectId) {
    res.status(400).json({ error: 'Missing x-project-id header' });
    return;
  }

  const config = await getProjectConfig(projectId);
  if (!config) {
    res.status(404).json({ error: 'Project configuration not found' });
    return;
  }

  req.projectConfig = config;
  next();
};
