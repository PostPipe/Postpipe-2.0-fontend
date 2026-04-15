import { NextRequest, NextResponse } from 'next/server';
import { verifyPikoApiKey } from '@/lib/api-auth';
import { createForm, getConnectors, getForms } from '@/lib/server-db';

/**
 * @api {post} /api/piko/v1/forms Create a new form
 * @apiHeader {String} x-piko-api-key Piko AI integration key
 * @apiBody {String} name Name of the form
 * @apiBody {String} connectorId ID of the connector to attach to
 * @apiBody {String} [targetDatabase] Optional target database name
 * @apiBody {Object[]} fields Array of form fields {name, type, required}
 * @apiBody {Object} [routing] Optional routing configuration
 */
export async function POST(req: NextRequest) {
    const apiKey = req.headers.get('x-piko-api-key');
    
    if (!apiKey) {
        return NextResponse.json({ error: 'Missing Piko API key' }, { status: 401 });
    }

    const userId = await verifyPikoApiKey(apiKey);
    if (!userId) {
        return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 403 });
    }

    try {
        const body = await req.json();
        let { name, connectorId, fields, targetDatabase, routing } = body;

        if (!name || !fields || !Array.isArray(fields)) {
            return NextResponse.json({ error: 'Missing required fields: name, fields' }, { status: 400 });
        }

        // Auto-resolve connector if missing or placeholder
        const connectors = await getConnectors(userId);
        if (!connectorId || connectorId === 'local-dev-connector' || connectorId === 'YOUR_CONNECTOR_ID') {
            if (connectors.length > 0) {
                connectorId = connectors[0].id;
                // If target database is also missing, pick the first one from this connector
                if (!targetDatabase && connectors[0].databases) {
                    targetDatabase = Object.keys(connectors[0].databases)[0];
                }
            } else {
                return NextResponse.json({ error: 'No connectors found for this user. Please register a connector first.' }, { status: 400 });
            }
        }

        const newForm = await createForm(
            connectorId,
            name,
            fields,
            userId,
            targetDatabase,
            routing
        );

        return NextResponse.json({
            success: true,
            message: 'Form created and deployed by Piko AI',
            form: {
                id: newForm.id,
                name: newForm.name,
                status: newForm.status,
                createdAt: newForm.createdAt
            }
        });

    } catch (e: any) {
        console.error('Piko Form Creation Error:', e);
        return NextResponse.json({ error: 'Failed to create form', details: e.message }, { status: 500 });
    }
}

/**
 * @api {get} /api/piko/v1/forms List all forms
 */
export async function GET(req: NextRequest) {
    const apiKey = req.headers.get('x-piko-api-key');
    
    if (!apiKey) {
        return NextResponse.json({ error: 'Missing Piko API key' }, { status: 401 });
    }

    const userId = await verifyPikoApiKey(apiKey);
    if (!userId) {
        return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 403 });
    }

    try {
        const forms = await getForms(userId);
        
        return NextResponse.json({
            success: true,
            forms: forms.map(f => ({
                id: f.id,
                name: f.name,
                status: f.status,
                createdAt: f.createdAt,
                fieldCount: f.fields?.length || 0
            }))
        });
    } catch (e: any) {
        console.error('Piko Form Fetch Error:', e);
        return NextResponse.json({ error: 'Failed to fetch forms', details: e.message }, { status: 500 });
    }
}

// Enable CORS for Piko AI
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-piko-api-key',
        },
    });
}
