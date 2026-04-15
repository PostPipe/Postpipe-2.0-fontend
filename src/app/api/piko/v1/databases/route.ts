import { NextRequest, NextResponse } from 'next/server';
import { verifyPikoApiKey } from '@/lib/api-auth';
import { getConnectors } from '@/lib/server-db';

/**
 * @api {get} /api/piko/v1/databases Fetch configured target databases
 * @apiHeader {String} x-piko-api-key Piko AI integration key
 * @apiParam {String} [connectorId] Optional connectorId to find config
 */
export async function GET(req: NextRequest) {
    const apiKey = req.headers.get('x-piko-api-key');
    const { searchParams } = new URL(req.url);
    const connectorId = searchParams.get('connectorId');
    
    if (!apiKey) {
        return NextResponse.json({ 
            success: false,
            error: 'Missing Piko API key' 
        }, { status: 401 });
    }

    const userId = await verifyPikoApiKey(apiKey);
    if (!userId) {
        return NextResponse.json({ 
            success: false,
            error: 'Invalid or unauthorized API key' 
        }, { status: 403 });
    }

    const connectors = await getConnectors(userId);
    let connector;
    
    if (connectorId) {
        connector = connectors.find(c => c.id === connectorId);
    } else {
        connector = connectors[0];
    }

    if (!connector) {
        return NextResponse.json({
            success: true,
            databases: {},
            message: "No connector or databases found for this user"
        });
    }

    try {
        // Source databases from the connector object directly
        const dbConfig = connector.databases || {};
        
        // Return the databases section. 
        // "uri field names" suggests the user wants access to the DB names and their URIs.
        return NextResponse.json({
            success: true,
            databases: dbConfig,
            connectorName: connector.name,
            connectorId: connector.id
        });

    } catch (e: any) {
        console.error('Piko Fetch Databases Error:', e);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to fetch database configurations',
            details: e.message 
        }, { status: 500 });
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
