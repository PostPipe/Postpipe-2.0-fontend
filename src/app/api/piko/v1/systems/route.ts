import { NextRequest, NextResponse } from 'next/server';
import { verifyPikoApiKey } from '@/lib/api-auth';
import { createSystem, getSystems } from '@/lib/server-db';

/**
 * @api {post} /api/piko/v1/systems Register a new System
 */
export async function POST(req: NextRequest) {
    const apiKey = req.headers.get('x-piko-api-key');
    if (!apiKey) return NextResponse.json({ error: 'Missing Piko API key' }, { status: 401 });

    const userId = await verifyPikoApiKey(apiKey);
    if (!userId) return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });

    try {
        const { name, type, templateId } = await req.json();
        if (!name || !type) {
            return NextResponse.json({ error: 'Missing required fields: name, type' }, { status: 400 });
        }

        const newSystem = await createSystem(name, type, templateId, userId);
        
        return NextResponse.json({
            success: true,
            message: `System '${name}' registered successfully`,
            system: newSystem
        });
    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to create system', details: e.message }, { status: 500 });
    }
}

/**
 * @api {get} /api/piko/v1/systems List user systems
 */
export async function GET(req: NextRequest) {
    const apiKey = req.headers.get('x-piko-api-key');
    if (!apiKey) return NextResponse.json({ error: 'Missing Piko API key' }, { status: 401 });

    const userId = await verifyPikoApiKey(apiKey);
    if (!userId) return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });

    try {
        const systems = await getSystems(userId);
        return NextResponse.json({ success: true, systems });
    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to fetch systems', details: e.message }, { status: 500 });
    }
}

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
