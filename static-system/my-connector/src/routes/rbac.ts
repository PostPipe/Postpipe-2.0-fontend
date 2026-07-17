import { Router } from 'express';
import { getAdapter } from '../lib/db';
import { authenticateRequest } from '../middleware/auth';

const router = Router();

// /api/rbac/init
router.post('/init', authenticateRequest, async (req, res) => {
    try {
        const { tableName, rolesCol, targetDatabase } = req.body;
        if (!tableName || !rolesCol) {
            return res.status(400).json({ error: 'tableName and rolesCol are required' });
        }

        const adapter = getAdapter();
        if (adapter.initRBACSchema) {
            await adapter.initRBACSchema(tableName, rolesCol, { targetDatabase });
            res.json({ success: true, message: 'RBAC schema initialized' });
        } else {
            res.status(501).json({ error: 'initRBACSchema not implemented for this adapter' });
        }
    } catch (e: any) {
        console.error('[RBAC Init Error]', e);
        res.status(500).json({ error: e.message });
    }
});

// /api/rbac/login
router.post('/login', authenticateRequest, async (req, res) => {
    try {
        const { tableName, emailCol, passwordCol, rolesCol, email, password, targetDatabase } = req.body;
        
        if (!tableName || !emailCol || !passwordCol || !rolesCol || !email || !password) {
            return res.status(400).json({ error: 'Missing required RBAC login fields' });
        }

        const adapter = getAdapter();
        if (adapter.verifyRBACLogin) {
            const user = await adapter.verifyRBACLogin(tableName, emailCol, passwordCol, rolesCol, email, password, { targetDatabase });
            if (user) {
                // Ensure they have an admin role
                let roles: string[] = [];
                try {
                    const rolesVal = user[rolesCol];
                    if (typeof rolesVal === 'string') {
                        try {
                            roles = JSON.parse(rolesVal);
                        } catch(e) {
                            roles = [rolesVal]; // simple string
                        }
                    } else if (Array.isArray(rolesVal)) {
                        roles = rolesVal;
                    } else if (rolesVal) {
                        roles = [rolesVal]; 
                    }
                } catch(e) {
                    roles = [user[rolesCol]];
                }

                // Check for admin role
                const isAdmin = roles.some(r => typeof r === 'string' && (r.toLowerCase() === 'admin' || r.toLowerCase() === 'master_admin'));
                
                if (isAdmin) {
                    res.json({ success: true, user: { email: user[emailCol], roles } });
                } else {
                    res.status(403).json({ error: 'User does not have admin privileges' });
                }
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(501).json({ error: 'verifyRBACLogin not implemented for this adapter' });
        }
    } catch (e: any) {
        console.error('[RBAC Login Error]', e);
        res.status(500).json({ error: e.message });
    }
});

export default router;
