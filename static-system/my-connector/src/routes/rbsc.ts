import { Router, Request, Response } from 'express';
import { getAdapter } from '../lib/db';

export const rbscRouter = Router();

// POST /postpipe/rbsc/init-schema
// Automatically alters the user schema to add roles arrays
rbscRouter.post('/init-schema', async (req: Request, res: Response) => {
    try {
        const { tableName, rolesCol = 'roles', targetDatabase, databaseConfig } = req.body;

        if (!tableName) {
            return res.status(400).json({ error: 'Missing tableName in request body' });
        }

        const context = { targetDatabase, databaseConfig };
        const adapter = getAdapter(databaseConfig?.type);

        // Call the appropriate method based on the adapter type (Postgres vs Mongo)
        if (adapter.addRBSCSchemaToTable) {
            await adapter.addRBSCSchemaToTable(tableName, rolesCol, context);
            return res.json({ status: 'ok', message: 'RBSC schema added to PostgreSQL table successfully' });
        } else if (adapter.addRBSCSchemaToCollection) {
            await adapter.addRBSCSchemaToCollection(tableName, rolesCol, context);
            return res.json({ status: 'ok', message: 'RBSC schema added to MongoDB collection successfully' });
        } else {
            return res.status(500).json({ error: 'Current database adapter does not support automatic RBSC schema initialization' });
        }

    } catch (err: any) {
        console.error('[RBSC] Error initializing schema:', err);
        return res.status(500).json({ error: 'Failed to initialize RBSC schema', details: err.message });
    }
});
