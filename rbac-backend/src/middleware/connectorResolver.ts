/**
 * connectorResolver Middleware
 *
 * Resolves the target connector from the project config and
 * attaches connector details to the request.
 */

import type { Response, NextFunction } from 'express';
import type { PostpipeRequest } from '../types';

/**
 * Reads the connector URL, secret, and database type from the
 * project config (already loaded by verifyJWT or loadProjectConfig)
 * and makes them available as req.connector.
 */
export const connectorResolver = (
  req: PostpipeRequest,
  res: Response,
  next: NextFunction
): void => {
  const config = req.projectConfig;

  if (!config) {
    res.status(500).json({ error: 'Project configuration not loaded' });
    return;
  }

  if (!config.connectorUrl || !config.connectorSecret) {
    res.status(503).json({
      error: 'Connector not configured for this project',
      hint: 'Set up your connector URL and secret in the PostPipe dashboard.',
    });
    return;
  }

  req.connector = {
    url: config.connectorUrl,
    secret: config.connectorSecret,
    databaseType: config.databaseType,
  };

  next();
};
