import { NextRequest, NextResponse } from 'next/server';
import { verifyPikoApiKey } from '@/lib/api-auth';
import { getForm, getConnectors, getAuthPresets } from '@/lib/server-db';
import { generateSnippets, generateAuthSnippet } from '@/lib/snippet-generator';

/**
 * @api {get} /api/piko/v1/snippets Get embedding snippets for a form
 */
export async function GET(req: NextRequest) {
    const apiKey = req.headers.get('x-piko-api-key');
    if (!apiKey) {
        return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    const userId = await verifyPikoApiKey(apiKey);
    if (!userId) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('formId');
    const presetId = searchParams.get('presetId');

    if (!formId && !presetId) {
        return NextResponse.json({ error: 'formId or presetId is required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    try {
        if (presetId) {
            const presets = await getAuthPresets(userId);
            const preset = presets.find(p => p.id === presetId);
            
            if (!preset) {
                return NextResponse.json({ error: 'Auth Preset not found' }, { status: 404 });
            }

            const { html, react } = generateAuthSnippet(preset, appUrl);

            return NextResponse.json({
                success: true,
                presetId: preset.id,
                presetName: preset.name,
                type: 'auth-preset',
                snippets: {
                    html,
                    react
                }
            });
        }

        // --- Standard Form Snippets ---
        if (!formId) {
            return NextResponse.json({ error: 'formId is required' }, { status: 400 });
        }

        const form = await getForm(formId);
        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        if (form.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized access to this form' }, { status: 403 });
        }

        const connectors = await getConnectors(userId);
        const connector = connectors.find(c => c.id === form.connectorId) || connectors[0];
        const connectorUrl = connector?.url || 'http://localhost:3002';

        const { html, react } = generateSnippets(
            form.id,
            form.name,
            form.fields.map((f: any) => ({
                label: f.name,
                type: f.type,
                required: f.required,
                options: f.options,
                reference: f.reference
            })),
            appUrl,
            connectorUrl
        );

        return NextResponse.json({
            success: true,
            formId: form.id,
            formName: form.name,
            snippets: {
                html,
                react
            }
        });

    } catch (e) {
        console.error('Error fetching snippets:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

