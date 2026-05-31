/**
 * PostPipe Connector — RBAC Routes
 *
 * This route receives translated, HMAC-signed RBAC operations from the
 * PostPipe Stateless Gateway and executes them against the developer's DB.
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getAdapter } from '../lib/db';

const router = Router();

const CONNECTOR_SECRET = process.env.POSTPIPE_CONNECTOR_SECRET || process.env.JWT_SECRET;

/**
 * Middleware: Verify HMAC signature from PostPipe Gateway
 */
const verifyRbacSignature = (req: Request, res: Response, next: Function) => {
    if (!CONNECTOR_SECRET) {
        console.error('[RBAC Route] Missing CONNECTOR_SECRET');
        return res.status(500).json({ success: false, error: 'Connector improperly configured' });
    }

    const signature = req.headers['x-postpipe-signature'] as string;
    if (!signature) {
        return res.status(401).json({ success: false, error: 'Missing signature' });
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
        return res.status(400).json({ success: false, error: 'Raw body missing' });
    }

    const expectedSignature = crypto
        .createHmac('sha256', CONNECTOR_SECRET)
        .update(rawBody)
        .digest('hex');

    // Secure compare
    try {
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
            return res.status(401).json({ success: false, error: 'Invalid signature' });
        }
    } catch {
        return res.status(401).json({ success: false, error: 'Invalid signature' });
    }

    next();
};

/**
 * POST /postpipe/rbac/query
 * Executes a normalized RBAC operation against the database.
 */
// @ts-ignore
router.post('/query', verifyRbacSignature, async (req: Request, res: Response) => {
    try {
        const { operation, databaseType } = req.body;
        if (!operation || !operation.verb || !operation.table) {
            return res.status(400).json({ success: false, error: 'Invalid operation payload' });
        }

        const adapter = getAdapter(databaseType || process.env.DB_TYPE);
        
        // Check if the adapter supports RBAC methods
        if (!adapter.insertRecord) {
            return res.status(501).json({ 
                success: false, 
                error: `Database adapter (${databaseType}) does not support RBAC methods yet. Please update the connector.` 
            });
        }

        await adapter.connect();

        const { verb, table, filter, data, options } = operation;
        let resultData: any = null;
        let count = 0;
        let success = false;

        switch (verb) {
            case 'findOne': {
                // We use queryRecords to find one
                const records = await adapter.queryRecords!(table, filter, { limit: 1 });
                if (records && records.length > 0) {
                    resultData = records[0];
                    success = true;
                }
                break;
            }
            case 'findMany': {
                const records = await adapter.queryRecords!(table, filter, options);
                resultData = records;
                count = records.length;
                success = true;
                break;
            }
            case 'insertOne': {
                resultData = await adapter.insertRecord!(table, data!);
                success = true;
                break;
            }
            case 'updateOne': {
                resultData = await adapter.updateRecord!(table, filter!, data!);
                success = true;
                break;
            }
            case 'deleteOne': {
                success = await adapter.deleteRecord!(table, filter!);
                break;
            }
            default:
                return res.status(400).json({ success: false, error: `Unsupported verb: ${verb}` });
        }

        return res.json({ success, data: resultData, count });
    } catch (error: any) {
        console.error('[RBAC Route] Execution Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
