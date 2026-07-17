import { NextRequest, NextResponse } from 'next/server';
import { verifyPikoApiKey } from '@/lib/api-auth';
import { createAuthPreset, getAuthPresets, getConnectors } from '@/lib/server-db';

/**
 * @api {post} /api/piko/v1/auth-presets Create a new Auth Preset
 * @apiHeader {String} x-piko-api-key Piko AI integration key
 * @apiBody {String} name Name of the preset
 * @apiBody {String} connectorId ID of the connector to attach to
 * @apiBody {String} [targetDatabase] Optional target database name
 * @apiBody {String} [projectId] Optional Project ID
 * @apiBody {String} [redirectUrl] Optional Redirect URL
 * @apiBody {String} [envFrontendUrlAlias] Optional Environment Frontend URL Alias
 * @apiBody {String} [apiUrl] Optional API URL
 * @apiBody {Object} providers Auth providers {email, google, github}
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
        let { 
            name, 
            connectorId, 
            targetDatabase, 
            projectId, 
            redirectUrl, 
            envFrontendUrlAlias, 
            apiUrl, 
            providers 
        } = body;

        if (!name || !providers) {
            return NextResponse.json({ error: 'Missing required fields: name, providers' }, { status: 400 });
        }

        // Auto-resolve connector if missing
        const connectors = await getConnectors(userId);
        if (!connectorId || connectorId === 'local-dev-connector' || connectorId === 'YOUR_CONNECTOR_ID') {
            if (connectors.length > 0) {
                connectorId = connectors[0].id;
                if (!targetDatabase && connectors[0].databases) {
                    targetDatabase = Object.keys(connectors[0].databases)[0];
                }
            } else {
                return NextResponse.json({ error: 'No connectors found. Please register a connector first.' }, { status: 400 });
            }
        }

        const newPreset = await createAuthPreset(userId, {
            name,
            connectorId,
            targetDatabase,
            projectId,
            redirectUrl,
            envFrontendUrlAlias,
            apiUrl,
            providers: {
                email: !!providers.email,
                google: !!providers.google,
                github: !!providers.github,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Auth Preset created successfully',
            preset: newPreset
        });

    } catch (e: any) {
        console.error('Piko Auth Preset Creation Error:', e);
        return NextResponse.json({ error: 'Failed to create auth preset', details: e.message }, { status: 500 });
    }
}

/**
 * @api {get} /api/piko/v1/auth-presets List all Auth Presets
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
        const presets = await getAuthPresets(userId);
        
        return NextResponse.json({
            success: true,
            presets
        });
    } catch (e: any) {
        console.error('Piko Auth Preset Fetch Error:', e);
        return NextResponse.json({ error: 'Failed to fetch auth presets', details: e.message }, { status: 500 });
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
