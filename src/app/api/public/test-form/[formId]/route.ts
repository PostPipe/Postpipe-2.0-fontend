import { NextRequest, NextResponse } from 'next/server';
import { getForm } from '../../../../../lib/server-db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    const { formId } = await params;

    let form: any = null;
    let notFound = false;

    try {
        form = await getForm(formId);
        if (!form) notFound = true;
    } catch {
        notFound = true;
    }

    const submitUrl = `${req.nextUrl.origin}/api/public/submit/${formId}`;
    const showSuccess = req.nextUrl.searchParams.get('success') === 'true';

    const fields: { name: string; type: string; required: boolean; label?: string }[] = form?.fields || [];

    const fieldInputs = fields.map((f) => {
        const label = f.label || f.name;
        const type = ['text', 'email', 'url', 'number', 'tel', 'date', 'password', 'color', 'checkbox', 'textarea'].includes(f.type) ? f.type : 'text';

        if (type === 'checkbox') {
            return `
            <div class="field">
                <label class="checkbox-label">
                    <input type="checkbox" name="${f.name}" value="true" />
                    <span>${label}${f.required ? ' <span class="req">*</span>' : ''}</span>
                </label>
            </div>`;
        }
        if (type === 'textarea') {
            return `
            <div class="field">
                <label for="${f.name}">${label}${f.required ? ' <span class="req">*</span>' : ''}</label>
                <textarea id="${f.name}" name="${f.name}" placeholder="Enter ${label}..." rows="3" ${f.required ? 'required' : ''}></textarea>
            </div>`;
        }
        return `
        <div class="field">
            <label for="${f.name}">${label}${f.required ? ' <span class="req">*</span>' : ''}</label>
            <input id="${f.name}" type="${type}" name="${f.name}" placeholder="${type === 'email' ? 'you@example.com' : `Enter ${label}...`}" ${f.required ? 'required' : ''} />
        </div>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${notFound ? 'Not Found' : `Test: ${form.name}`} · Postpipe</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg: #0a0a0f;
            --surface: #13131a;
            --surface2: #1c1c28;
            --border: rgba(255,255,255,0.07);
            --border2: rgba(255,255,255,0.12);
            --text: rgba(255,255,255,0.90);
            --muted: rgba(255,255,255,0.38);
            --accent: #7c3aed;
            --accent-light: #a78bfa;
            --green: #34d399;
            --red: #f87171;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 48px 16px;
        }

        /* Aurora background */
        body::before {
            content: '';
            position: fixed;
            inset: 0;
            background:
                radial-gradient(ellipse 80% 60% at 0% 0%, rgba(124,58,237,0.18) 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 100% 0%, rgba(59,130,246,0.12) 0%, transparent 60%);
            pointer-events: none;
            z-index: 0;
        }

        .container {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 520px;
        }

        /* Logo / brand */
        .brand {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 32px;
            font-size: 13px;
            font-weight: 600;
            color: var(--muted);
        }
        .brand-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            background: var(--accent-light);
            box-shadow: 0 0 8px rgba(167,139,250,0.6);
        }

        /* Card */
        .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 24px 80px rgba(0,0,0,0.5);
        }

        .card-header {
            padding: 24px 28px 20px;
            border-bottom: 1px solid var(--border);
            background: linear-gradient(135deg, rgba(124,58,237,0.08) 0%, transparent 60%);
        }

        .endpoint-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-family: 'SF Mono', 'Fira Code', monospace;
            font-size: 11px;
            color: var(--muted);
            background: rgba(255,255,255,0.04);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 4px 10px;
            margin-bottom: 12px;
        }
        .endpoint-badge .method {
            color: var(--accent-light);
            font-weight: 700;
        }

        .card-header h1 {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: var(--text);
        }
        .card-header p {
            font-size: 13px;
            color: var(--muted);
            margin-top: 4px;
        }

        .status-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 14px;
            flex-wrap: wrap;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 3px 9px;
            border-radius: 99px;
        }
        .badge-live { background: rgba(52,211,153,0.1); color: var(--green); border: 1px solid rgba(52,211,153,0.25); }
        .badge-paused { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
        .badge-fields { background: rgba(167,139,250,0.1); color: var(--accent-light); border: 1px solid rgba(167,139,250,0.2); }
        .dot-pulse {
            width: 6px; height: 6px;
            border-radius: 50%;
            background: currentColor;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

        /* Form */
        form { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 18px; }

        .field { display: flex; flex-direction: column; gap: 6px; }
        label {
            font-size: 12px;
            font-weight: 600;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }
        .req { color: #f87171; }

        input[type="text"], input[type="email"], input[type="url"],
        input[type="number"], input[type="tel"], input[type="date"],
        input[type="password"], input[type="color"], textarea {
            width: 100%;
            background: var(--surface2);
            border: 1px solid var(--border2);
            color: var(--text);
            font-size: 14px;
            border-radius: 12px;
            padding: 10px 14px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            font-family: inherit;
        }
        input:focus, textarea:focus {
            border-color: rgba(124,58,237,0.5);
            box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }
        textarea { resize: vertical; min-height: 80px; }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: normal;
            color: var(--text);
            text-transform: none;
            letter-spacing: 0;
        }
        input[type="checkbox"] {
            width: 18px; height: 18px;
            cursor: pointer;
            accent-color: var(--accent);
        }

        .submit-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            background: linear-gradient(135deg, #7c3aed, #4f46e5);
            color: white;
            box-shadow: 0 4px 20px rgba(124,58,237,0.35);
            margin-top: 4px;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(124,58,237,0.45); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Success / error banners */
        .banner {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 14px 18px;
            border-radius: 14px;
            font-size: 13px;
            font-weight: 500;
            margin: 0 28px 0;
        }
        .banner-success { background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.25); color: var(--green); }
        .banner-error { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.25); color: var(--red); }
        .banner-icon { font-size: 16px; margin-top: 1px; }

        /* JSON output */
        .response-panel {
            margin: 0 28px 24px;
            display: none;
        }
        .response-panel.visible { display: block; }
        .response-label {
            font-size: 11px;
            font-weight: 700;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 8px;
        }
        pre {
            background: var(--surface2);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 14px;
            font-family: 'SF Mono', 'Fira Code', monospace;
            font-size: 12px;
            color: var(--muted);
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-all;
        }

        /* Empty state */
        .empty {
            padding: 40px 28px;
            text-align: center;
            color: var(--muted);
        }
        .empty-icon { font-size: 36px; margin-bottom: 12px; }
        .empty h3 { font-size: 16px; color: var(--text); margin-bottom: 6px; }
        .empty p { font-size: 13px; }

        /* 404 */
        .not-found { text-align: center; padding: 48px 28px; }
        .not-found h1 { font-size: 56px; font-weight: 900; color: rgba(255,255,255,0.06); margin-bottom: 8px; }
        .not-found h2 { font-size: 20px; font-weight: 700; }
        .not-found p { font-size: 14px; color: var(--muted); margin-top: 8px; }

        /* Footer */
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: rgba(255,255,255,0.15);
        }
        .footer a { color: var(--accent-light); text-decoration: none; }
    </style>
</head>
<body>
<div class="container">
    <div class="brand">
        <div class="brand-dot"></div>
        Postpipe · Endpoint Test Console
    </div>

    <div class="card">
        ${notFound ? `
        <div class="not-found">
            <h1>404</h1>
            <h2>Form Not Found</h2>
            <p>No endpoint with ID <code>${formId}</code> was found.</p>
        </div>
        ` : `
        <div class="card-header">
            <div class="endpoint-badge">
                <span class="method">POST</span>
                /api/public/submit/${formId}
            </div>
            <h1>${form.name}</h1>
            <p>Interactive endpoint test console — fill in the fields and submit below.</p>
            <div class="status-row">
                <span class="badge ${form.status === 'Live' ? 'badge-live' : 'badge-paused'}">
                    <span class="dot-pulse"></span>
                    ${form.status}
                </span>
                <span class="badge badge-fields">${fields.length} field${fields.length !== 1 ? 's' : ''}</span>
            </div>
        </div>

        ${showSuccess ? `
        <div class="banner banner-success" style="margin-top:20px;">
            <span class="banner-icon">✓</span>
            <div><strong>Submission successful!</strong> Your data was forwarded to the connector.</div>
        </div>` : ''}

        <div id="response-panel" class="response-panel">
            <div class="response-label">Response</div>
            <pre id="response-output"></pre>
        </div>

        ${fields.length === 0 ? `
        <div class="empty">
            <div class="empty-icon">📋</div>
            <h3>No fields configured</h3>
            <p>This endpoint has no declared fields. You can still POST raw JSON to it.</p>
        </div>
        ` : `
        <form id="test-form">
            ${fieldInputs}
            <button type="submit" class="submit-btn" id="submit-btn">
                ▶ Submit to Endpoint
            </button>
        </form>
        `}
        `}
    </div>

    <div class="footer">
        Powered by <a href="/">Postpipe</a> · ${submitUrl}
    </div>
</div>

<script>
    const form = document.getElementById('test-form');
    const btn = document.getElementById('submit-btn');
    const panel = document.getElementById('response-panel');
    const output = document.getElementById('response-output');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            btn.disabled = true;
            btn.textContent = 'Sending…';

            const data = {};
            new FormData(form).forEach((v, k) => { data[k] = v; });

            try {
                const res = await fetch('${submitUrl}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const json = await res.json();

                panel.classList.add('visible');
                output.textContent = JSON.stringify(json, null, 2);
                output.style.color = res.ok ? 'rgba(52,211,153,0.9)' : 'rgba(248,113,113,0.9)';

                if (res.ok) btn.textContent = '✓ Submitted!';
                else btn.textContent = '✗ Failed';
            } catch (err) {
                panel.classList.add('visible');
                output.textContent = 'Error: ' + err.message;
                output.style.color = 'rgba(248,113,113,0.9)';
                btn.textContent = '✗ Error';
            }

            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = '▶ Submit to Endpoint';
            }, 3000);
        });
    }
</script>
</body>
</html>`;

    return new NextResponse(html, {
        status: notFound ? 404 : 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
