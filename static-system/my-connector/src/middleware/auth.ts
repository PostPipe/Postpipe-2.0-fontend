import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../lib/security';
import crypto from 'crypto';
import { getPrefixedEnv } from '../lib/config';

const CONNECTOR_SECRET = getPrefixedEnv('POSTPIPE_CONNECTOR_SECRET') || getPrefixedEnv('JWT_SECRET');

export function authenticateRequest(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const authCookie = (req as any).cookies?.pp_auth_token;

    let token = authCookie;
    if (!token && authHeader) {
        const match = authHeader.match(/^Bearer\s+(.+)$/i);
        if (match) token = match[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    // 1. Try JWT validation
    const jwtPayload = verifyJwt(token, CONNECTOR_SECRET as string);
    if (jwtPayload) {
        (req as any).user = jwtPayload;
        return next();
    }

    // 2. Fallback to secret comparison
    try {
        const tokenBuf = Buffer.from(token);
        const secretBuf = Buffer.from(CONNECTOR_SECRET as string);
        if (tokenBuf.length === secretBuf.length && crypto.timingSafeEqual(tokenBuf, secretBuf)) {
            return next();
        }
    } catch (e) {
        // Ignore buffer errors
    }

    return res.status(403).json({ error: 'Forbidden: Invalid Token' });
}
