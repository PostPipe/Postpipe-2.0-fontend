import { NextRequest, NextResponse } from 'next/server';
import { verifyPikoApiKey } from '@/lib/api-auth';
import { getAuthPresets, updateAuthPreset, deleteAuthPreset } from '@/lib/server-db';

/**
 * @api {get} /api/piko/v1/auth-presets/[id] Get a specific Auth Preset
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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
        const preset = presets.find(p => p.id === id);
        
        if (!preset) {
            return NextResponse.json({ error: 'Auth Preset not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            preset
        });
    } catch (e: any) {
        console.error('Piko Auth Preset Single Fetch Error:', e);
        return NextResponse.json({ error: 'Failed to fetch auth preset', details: e.message }, { status: 500 });
    }
}

/**
 * @api {patch} /api/piko/v1/auth-presets/[id] Update an Auth Preset
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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
        
        // Filter out fields that shouldn't be updated or are ignored
        const updates = { ...body };
        delete updates.id;
        delete updates.createdAt;

        await updateAuthPreset(userId, id, updates);

        return NextResponse.json({
            success: true,
            message: 'Auth Preset updated successfully'
        });

    } catch (e: any) {
        console.error('Piko Auth Preset Update Error:', e);
        return NextResponse.json({ error: 'Failed to update auth preset', details: e.message }, { status: 500 });
    }
}

/**
 * @api {delete} /api/piko/v1/auth-presets/[id] Delete an Auth Preset
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiKey = req.headers.get('x-piko-api-key');
    
    if (!apiKey) {
        return NextResponse.json({ error: 'Missing Piko API key' }, { status: 401 });
    }

    const userId = await verifyPikoApiKey(apiKey);
    if (!userId) {
        return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 403 });
    }

    try {
        await deleteAuthPreset(userId, id);

        return NextResponse.json({
            success: true,
            message: 'Auth Preset deleted successfully'
        });

    } catch (e: any) {
        console.error('Piko Auth Preset Delete Error:', e);
        return NextResponse.json({ error: 'Failed to delete auth preset', details: e.message }, { status: 500 });
    }
}

// Enable CORS for Piko AI
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-piko-api-key',
        },
    });
}
