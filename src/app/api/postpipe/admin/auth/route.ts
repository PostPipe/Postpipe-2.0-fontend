import { NextRequest, NextResponse } from 'next/server';
import { getDB, getConnector, UserSystemsDocument } from '../../../../../lib/server-db';
import { ensureFullUrl } from '../../../../../lib/utils';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { systemId, action, email, password } = body;

        const db = await getDB();
        const doc = await db.collection<UserSystemsDocument>('user_rbac_systems').findOne({ "systems.id": systemId });
        if (!doc) {
            return NextResponse.json({ error: 'System not found' }, { status: 404 });
        }

        const system = doc.systems.find(s => s.id === systemId);
        if (!system || !system.settings) {
            return NextResponse.json({ error: 'System settings not found' }, { status: 404 });
        }

        const connector = await getConnector(system.templateId!);
        if (!connector) {
            return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
        }

        const connectorUrl = ensureFullUrl(connector.url);

        if (action === 'check_setup') {
            // For now, assume setup is complete.
            // If we want to check if a master admin exists, we could proxy a request here.
            return NextResponse.json({ isSetup: true });
        }

        if (action === 'trigger_setup') {
            return NextResponse.json({ success: true, message: 'Setup email sent to developer.' });
        }

        if (action === 'login') {
            // Proxy request to Connector's login endpoint
            const proxyRes = await fetch(`${connectorUrl}/api/rbac/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${connector.secret}` // Uses connector secret for auth
                },
                body: JSON.stringify({
                    email,
                    password,
                    targetDatabase: system.settings.targetDatabase,
                    tableName: system.settings.tableName,
                    emailCol: system.settings.emailCol,
                    passwordCol: system.settings.passwordCol,
                    rolesCol: system.settings.rolesCol
                })
            });

            if (!proxyRes.ok) {
                const err = await proxyRes.json().catch(() => ({ error: 'Unknown error from connector' }));
                return NextResponse.json({ success: false, message: err.error || 'Invalid credentials' }, { status: proxyRes.status });
            }

            const data = await proxyRes.json();
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
