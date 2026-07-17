import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getForm, getConnector } from '../../../../../../lib/server-db';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ formId: string }> }
) {
    try {
        const { formId } = await params;
        const form = await getForm(formId);

        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404, headers: corsHeaders });
        }

        const connector = await getConnector(form.connectorId);
        if (!connector) {
             return NextResponse.json({ error: 'Connector not provisioned' }, { status: 503, headers: corsHeaders });
        }

        // Verify Token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const token = authHeader.split(' ')[1];

        // Token Format: pp_read_PAYLOAD.SIGNATURE
        const parts = token.split('.');
        if (parts.length !== 2) {
             return NextResponse.json({ error: 'Invalid token format' }, { status: 401, headers: corsHeaders });
        }
        
        const [prefixAndPayload, signature] = parts;
        if (!prefixAndPayload.startsWith('pp_read_')) {
             return NextResponse.json({ error: 'Invalid token prefix' }, { status: 401, headers: corsHeaders });
        }
        
        const payloadB64 = prefixAndPayload.slice('pp_read_'.length);
        
        if (!payloadB64 || !signature) {
             return NextResponse.json({ error: 'Invalid token content' }, { status: 401, headers: corsHeaders });
        }

        // Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', connector.secret)
            .update(payloadB64)
            .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401, headers: corsHeaders });
        }

        // Return submissions from DB
        const submissions = form.submissions || [];

        return NextResponse.json({ 
            formId: form.id,
            submissions 
        }, { headers: corsHeaders });

    } catch (e) {
        console.error("Error fetching submissions:", e);
         return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}
