import crypto from 'crypto';

// Types
export interface PostPipeForm {
  id: string;
  name: string;
  createdAt: string;
}

// In a real app, this would be in your database.
// PostPipe Core knows about Forms, but NOT Submissions.
const MOCK_FORMS: PostPipeForm[] = [
  { id: 'contact-us', name: 'Contact Form', createdAt: '2023-01-15' },
  { id: 'newsletter', name: 'Newsletter Signup', createdAt: '2023-02-20' },
  { id: 'beta-access', name: 'Beta Waitlist', createdAt: '2023-03-10' },
];

// Matches my-secure-bridge/.env
const DEMO_SECRET = "sk_live_01pi2uy7oebonp9y8628po";

export function getForms() {
  return MOCK_FORMS;
}

export function generateReadToken(formId: string) {
  const payload = {
    formId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year
  };
  
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', DEMO_SECRET)
    .update(payloadB64)
    .digest('hex');
    
  return `pp_read_${payloadB64}.${signature}`;
}

export function getConnectorUrl(formId: string) {
  // Assuming the user's connector is running locally
  return `http://localhost:3001/api/postpipe/forms/${formId}/submissions`;
}

// ... existing imports ...

export function getIngestUrl() {
  return `http://localhost:3001/postpipe/ingest`;
}

export async function submitMockForm(formId: string, formData: any) {
    const timestamp = new Date().toISOString();
    const submissionId = `sub_${Math.random().toString(36).substr(2, 9)}`;
    
    // Construct the payload as PostPipe Core would
    const payload = {
        formId,
        submissionId,
        timestamp,
        data: formData,
        signature: "legacy_field_ignored_but_required_by_type" 
    };

    // Sign the payload (mimicking Core's behavior)
    // IMPORTANT: The server usually verifies the raw body. 
    // In a browser fetch, getting the exact raw body string that `JSON.stringify` produces 
    // AND that the server receives can be tricky if frameworks modify it.
    // Ideally, we stringify once, sign it, and send that string.
    
    const bodyString = JSON.stringify(payload);
    
    const signature = crypto
        .createHmac('sha256', DEMO_SECRET)
        .update(bodyString)
        .digest('hex');

    // Send to Connector
    const res = await fetch(getIngestUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-postpipe-signature': signature
        },
        body: bodyString
    });

    if (!res.ok) {
        throw new Error(`Ingest Failed: ${res.status} ${res.statusText}`);
    }

    return await res.json();
}
