import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getForm, getConnector, incrementSubmissionCount, getUserDatabaseConfig } from '../../../../../lib/server-db';
import { ensureFullUrl } from '../../../../../lib/utils';

// ---- CORS helper ----
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
};

// Handle browser CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const form = await getForm(formId);

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404, headers: corsHeaders });
    }

    if (form.status === 'Paused') {
      return NextResponse.json({ error: 'Form is paused and not accepting submissions.' }, { status: 423, headers: corsHeaders });
    }

    // --- Rate Limit Check ---
    console.log(`[RateLimit] form.userId = "${form.userId}", formId = "${formId}"`);
    if (form.userId) {
      const { incrementAndCheckSubmissionLimit } = await import('../../../../../lib/rate-limit');
      const isAllowed = await incrementAndCheckSubmissionLimit(form.userId);
      console.log(`[RateLimit] incrementAndCheckSubmissionLimit result = ${isAllowed}`);
      
      if (!isAllowed) {
        return NextResponse.json({ 
          error: 'Rate Limit Exceeded: The owner of this form has reached their monthly submission limit. Please contact the administrator.' 
        }, { status: 429, headers: corsHeaders });
      }
    } else {
      console.warn(`[RateLimit] SKIPPED: form.userId is missing for formId="${formId}"`);
    }
    // ------------------------

    const connector = await getConnector(form.connectorId);
    if (!connector) {
      return NextResponse.json({ error: 'Connector not provisioned' }, { status: 503, headers: corsHeaders });
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

    let databaseConfig = null;
    const target = form.targetDatabase || "default";

    try {
      if (form.userId) {
        const userConfig = await getUserDatabaseConfig(form.userId);
        if (userConfig && userConfig.databases && userConfig.databases[target]) {
          const config = userConfig.databases[target];
          databaseConfig = {
            uri: config.uri,
            dbName: config.dbName,
            type: config.type || 'mongodb'
          };
          console.log(`[Proxy] Resolved DB Config for '${target}' via User Config: ${config.uri}, Type: ${databaseConfig.type}`);
        }
      }

      if (!databaseConfig && connector.databases && connector.databases[target]) {
        const config = connector.databases[target];
        databaseConfig = {
          uri: config.uri,
          dbName: config.dbName,
          type: config.type || 'mongodb'
        };
        console.log(`[Proxy] Resolved DB Config for '${target}' via Connector: ${config.uri}, Type: ${databaseConfig.type}`);
      }

      if (!databaseConfig) {
        console.warn(`[Proxy] Target '${target}' not found in regular databases.`);
      }
    } catch (e) {
      console.error("[Proxy] Error resolving user database config:", e);
    }

    const payload = {
      formId,
      formName: form.name,
      submissionId,
      timestamp,
      data,
      targetDatabase: form.targetDatabase || "default",
      databaseConfig,
      routing: form.routing, // Pass the routing config
      signature: "legacy_proxied"
    };

    // 2.5 Save to Internal DB (Static Storage) - DISABLED

    // 3. Sign Payload (Simulating Core Security)
    const bodyString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', connector.secret)
      .update(bodyString)
      .digest('hex');

    // 4. Forward to Connector Webhook
    // In real PostPipe, this happens asynchronously via a queue.
    const ingestUrl = `${ensureFullUrl(connector.url)}/postpipe/ingest`;

    console.log(`[Proxy] Prepared Payload:`, JSON.stringify(payload, null, 2));
    console.log(`[Proxy] Forwarding to ${ingestUrl}`);

    try {
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
        console.error(`[Proxy] Webhook failed details: Status=${res.status} Text=${errText}`);
        return NextResponse.json({ error: `Connector error: ${errText || res.statusText}` }, { status: 502, headers: corsHeaders });
      }

      const successText = await res.text();
      console.log(`[Proxy] Webhook success: ${res.status} ${successText}`);

      // 5. Increment Submission Count (Zero Data Retention compliant)
      await incrementSubmissionCount(formId);
    } catch (e: any) {
      console.error(`[Proxy] Connection failed to ${ingestUrl}`, e);
      return NextResponse.json({ error: `Connection failed: ${e?.message || 'Connector unreachable'}` }, { status: 502, headers: corsHeaders });
    }

    // 6. Success Handling (Industry Standard: Formspree / Typeform / Webflow pattern)
    const acceptHeader = req.headers.get('accept') || '';
    const isJson = contentType.includes('application/json');
    const acceptsJson = acceptHeader.includes('application/json');
    const isAjax = isJson || acceptsJson || req.headers.get('x-requested-with') === 'XMLHttpRequest';

    // If request was made via JavaScript fetch/XHR or explicitly expects JSON:
    if (isAjax) {
      return NextResponse.json({
        success: true,
        submissionId,
        message: "Thank you! Your submission has been received."
      }, { status: 200, headers: corsHeaders });
    }

    // Otherwise, this is a native browser HTML form submission (<form action="..." method="POST">)
    const customRedirect = (data && (data._next || data.redirectUrl || data._redirect)) || (form as any).redirectUrl || (form as any).settings?.redirectUrl;
    if (customRedirect && typeof customRedirect === 'string') {
      try {
        const redirectUrl = new URL(customRedirect, req.url);
        redirectUrl.searchParams.set('success', 'true');
        return NextResponse.redirect(redirectUrl.toString(), 303);
      } catch (err) {
        console.warn(`[Proxy] Invalid custom redirect URL: ${customRedirect}`);
      }
    }

    const referer = req.headers.get('referer');
    if (referer) {
      try {
        const url = new URL(referer);
        url.searchParams.set('success', 'true');
        // HTTP 303 See Other ensures browser issues a GET request to the redirect URL
        return NextResponse.redirect(url.toString(), 303);
      } catch (err) {
        console.warn(`[Proxy] Could not parse referer: ${referer}`);
      }
    }

    // Standalone Thank You page fallback when submitting direct HTML form without referer
    const successHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submission Received · Postpipe</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #09090b;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #18181b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      max-width: 440px;
      width: 100%;
      padding: 36px 28px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon-wrapper {
      width: 56px;
      height: 56px;
      margin: 0 auto 20px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #22c55e;
      font-size: 26px;
      font-weight: bold;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14px;
      color: #a1a1aa;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      font-family: monospace;
      font-size: 11px;
      color: #71717a;
      background: rgba(255, 255, 255, 0.04);
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 600;
      color: #09090b;
      background: #fafafa;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s;
    }
    .btn:hover {
      background: #e4e4e7;
    }
    .footer {
      margin-top: 24px;
      font-size: 11px;
      color: #52525b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrapper">✓</div>
    <h1>Submission Received!</h1>
    <p>Thank you. Your submission for <strong>${form.name || 'this form'}</strong> has been securely recorded.</p>
    <div class="badge">ID: ${submissionId}</div>
    <div>
      <a href="javascript:history.back()" class="btn">← Go Back</a>
    </div>
    <div class="footer">Powered by Postpipe</div>
  </div>
</body>
</html>`;

    return new NextResponse(successHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
