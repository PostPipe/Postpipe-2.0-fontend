import { NextRequest, NextResponse } from 'next/server';
import { verifyPikoApiKey } from '@/lib/api-auth';
import { getConnectors } from '@/lib/server-db';

/**
 * @api {get} /api/piko/v1/connectorsAndSecrets Fetch user connectors and their secrets
 * @apiHeader {String} x-piko-api-key Piko AI integration key
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
        const connectors = await getConnectors(userId);
        
        // Map to return only essential info including secrets
        const formattedConnectors = connectors.map(c => ({
            id: c.id,
            name: c.name,
            secret: c.secret,
            url: c.url,
            envPrefix: c.envPrefix
        }));

        return NextResponse.json({
            success: true,
            connectors: formattedConnectors
        });

    } catch (e: any) {
        console.error('Piko Fetch Connectors Error:', e);
        return NextResponse.json({ error: 'Failed to fetch connectors', details: e.message }, { status: 500 });
    }
}

// Enable CORS for Piko AI
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-piko-api-key',
        },
    });
}
