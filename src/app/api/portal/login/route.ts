import { NextRequest, NextResponse } from 'next/server';
import { getConnector, getForm } from '@/lib/server-db';
import { ensureFullUrl } from '@/lib/utils';

const CONNECTOR_ID = 'conn_jjho7d5eg';
const DB_NAME      = 'postgres-url';
const SYSTEM_ID    = 'rbac_zqvhub9g0';

async function fetchSubmissions(connectorUrl: string, connectorSecret: string, formId: string) {
    const url = new URL(`${connectorUrl}/postpipe/data`);
    url.searchParams.set('formId', formId);
    
    const form = await getForm(formId);
    if (form && form.name) {
        url.searchParams.set('formName', form.name);
    }

    url.searchParams.set('targetDatabase', DB_NAME);
    url.searchParams.set('databaseConfig', JSON.stringify({ uri: DB_NAME }));
    url.searchParams.set('limit', '500');

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${connectorSecret}` },
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Connector error for form ${formId}: ${res.status} ${text}`);
    }

    const data = await res.json();
    return (data.data || []) as any[];
}

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Get connector config server-side (no JWT exposure to client)
        const connector = await getConnector(CONNECTOR_ID);
        if (!connector) {
            return NextResponse.json({ error: 'Connector not configured' }, { status: 500 });
        }

        const connectorUrl = ensureFullUrl(connector.url);

        // Fetch all users, roles, and permissions in parallel
        const [users, roles, perms] = await Promise.all([
            fetchSubmissions(connectorUrl, connector.secret, 'users'),
            fetchSubmissions(connectorUrl, connector.secret, 'roles-4'),
            fetchSubmissions(connectorUrl, connector.secret, 'permissions-4'),
        ]);

        // Find user by email (case-insensitive)
        const userRecord = users.find(
            (u: any) => (u.data?.email || '').toLowerCase() === email.toLowerCase()
        );

        if (!userRecord) {
            return NextResponse.json({ error: 'No account found with that email.' }, { status: 401 });
        }

        // Verify password
        if ((userRecord.data?.password || '') !== password) {
            return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
        }

        const roleId = userRecord.data?.roles || '';

        // Resolve role name
        const roleRecord = roles.find(
            (r: any) => r.submissionId === roleId || r.id === roleId || r._id === roleId
        );
        const roleData = roleRecord?.data?.data || roleRecord?.data;
        const roleName = roleData?.name || roleData?.text || (roleId ? roleId : null);

        if (!roleId) {
            return NextResponse.json({
                success: true,
                user: {
                    name:  userRecord.data?.name || userRecord.data?.email || email,
                    email: userRecord.data?.email || email,
                    roleId:   null,
                    roleName: null,
                },
                accessibleForms: [],
                message: 'No role assigned.',
                debug: { roleId, foundRoleRecord: !!roleRecord, rolesCount: roles.length, roleName }
            });
        }

        // Find the latest permission record for this role
        const permRecord = [...perms].reverse().find(
            (p: any) => (p.data?.data?.role || p.data?.role) === roleId
        );

        let accessibleFormIds: any = permRecord?.data?.data?.accessible_forms || permRecord?.data?.accessible_forms || [];
        if (typeof accessibleFormIds === 'string') {
            accessibleFormIds = (accessibleFormIds as string).split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        // Fetch managed forms list for display names
        let managedForms: any[] = [];
        try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
            const mfRes = await fetch(`${appUrl}/api/public/rbac/${SYSTEM_ID}/forms`, { cache: 'no-store' });
            if (mfRes.ok) {
                const mfData = await mfRes.json();
                managedForms = mfData.forms || [];
            }
        } catch (_) {}

        const formIdToName: Record<string, string> = {};
        managedForms.forEach((f: any) => { formIdToName[f.id] = f.name || f.id; });

        const accessibleForms = accessibleFormIds.map((id: string) => ({
            id,
            name: formIdToName[id] || id,
        }));

        return NextResponse.json({
            success: true,
            user: {
                name:     userRecord.data?.name  || userRecord.data?.email || email,
                email:    userRecord.data?.email || email,
                roleId,
                roleName,
            },
            accessibleForms
        });

    } catch (e: any) {
        console.error('[portal/login] error:', e);
        return NextResponse.json({ error: 'Internal server error: ' + e.message }, { status: 500 });
    }
}
