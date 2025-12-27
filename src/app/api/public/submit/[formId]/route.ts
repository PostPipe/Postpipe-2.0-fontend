import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getForm, getConnector } from '../../../../../lib/server-db';

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const form = await getForm(formId);

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const connector = await getConnector(form.connectorId);
    if (!connector) {
      return NextResponse.json({ error: 'Connector not provisioned' }, { status: 503 });
    }

    // 1. Extract Data
    // Supports JSON and FormData (standard HTML forms)
    const contentType = req.headers.get('content-type') || '';
    let data: Record<string, any> = {};

    if (contentType.includes('application/json')) {
      data = await req.json();
    } else {
        const formData = await req.formData();
        formData.forEach((value, key) => {
            // Simple handling. For multi-selects, this needs array logic.
            data[key] = value;
        });
    }

    // 2. Prepare Payload
    const timestamp = new Date().toISOString();
    const submissionId = `sub_${Math.random().toString(36).substr(2, 9)}`;
    const payload = {
        formId,
        submissionId,
        timestamp,
        data,
        signature: "legacy_proxied" 
    };

    // 3. Sign Payload (Simulating Core Security)
    const bodyString = JSON.stringify(payload);
    const signature = crypto
        .createHmac('sha256', connector.secret)
        .update(bodyString)
        .digest('hex');

    // 4. Forward to Connector Webhook
    // In real PostPipe, this happens asynchronously via a queue.
    const ingestUrl = `${connector.url}/postpipe/ingest`; 
    
    console.log(`[Proxy] Forwarding to ${ingestUrl}`);

    const res = await fetch(ingestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-postpipe-signature': signature
        },
        body: bodyString
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error(`[Proxy] Webhook failed: ${res.status} ${errText}`);
        return NextResponse.json({ error: 'Connector rejected submission' }, { status: 502 });
    }

    // 5. Success
    // If it's a browser form submit, redirect back (or to thank you page)
    // For API calls, return JSON.
    if (!contentType.includes('application/json')) {
        // Simple redirect back to referrer or a success page
        const referer = req.headers.get('referer');
        if (referer) {
             const url = new URL(referer);
             url.searchParams.set('success', 'true');
             return NextResponse.redirect(url);
        }
    }

    return NextResponse.json({ success: true, submissionId });

  } catch (error: any) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
