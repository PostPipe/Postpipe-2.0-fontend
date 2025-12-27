'use client';

import { useState } from 'react';

// Demo Configuration
// In a real app, this token would come from your backend or PostPipe Dashboard config
// For this local demo, we use a token valid for the "contact-us" form signed with the local secret.
// Generated via: manual-test.ts logic
const DEMO_TOKEN_PAYLOAD = "eyJmb3JtSWQiOiJjb250YWN0LXVzIiwiZXhwIjoyNTU2MTM1MDAwfQ"; // formId: contact-us, exp: far future
const DEMO_SIGNATURE = "741d409028020ff6865612c6a8f15b8014582f3a469396aace6231eb560b37ab"; // HMAC(payload, secret='sk_live_...')
const DEMO_TOKEN = `pp_read_${DEMO_TOKEN_PAYLOAD}.${DEMO_SIGNATURE}`;

export default function GetterDemoPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            // Connect to the User-Hosted Connector
            // Note: This relies on `my-secure-bridge` running on port 3001 and CORS being allowed (or proxy).
            // Since it's a server-to-server API usually, calling from Browser might hit CORS if not configured.
            // If CORS fails, we might need a Next.js API route proxy. Let's try direct first.
            const res = await fetch('http://localhost:3001/api/postpipe/forms/contact-us/submissions?limit=5', {
                headers: {
                    'Authorization': `Bearer ${DEMO_TOKEN}`
                }
            });

            if (!res.ok) {
                throw new Error(`Failed: ${res.status} ${res.statusText}`);
            }

            const json = await res.json();
            setData(json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <header className="space-y-4 border-b border-neutral-800 pb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        PostPipe <span className="text-emerald-400">Getter API</span> Demo
                    </h1>
                    <p className="text-lg text-neutral-400">
                        Fetch submissions directly from your self-hosted connector, bypassing PostPipe Core.
                    </p>
                </header>

                {/* Control Panel */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Connector Status</h2>
                            <p className="text-sm text-neutral-500">Endpoint: http://localhost:3001</p>
                        </div>
                        <button
                            onClick={fetchSubmissions}
                            disabled={loading}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Fetching...' : 'Fetch Submissions'}
                        </button>
                    </div>

                    <div className="p-3 bg-neutral-950/50 rounded-lg border border-neutral-800 font-mono text-xs text-neutral-500 break-all">
                        <span className="text-emerald-500/50">Authorization: Bearer</span> {DEMO_TOKEN}
                    </div>
                </div>

                {/* Results Display */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Response Data</h3>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                            {error}
                        </div>
                    )}

                    {!data && !error && (
                        <div className="p-12 border border-dashed border-neutral-800 rounded-xl text-center text-neutral-600">
                            Click "Fetch Submissions" to test your connector.
                        </div>
                    )}

                    {data && (
                        <div className="relative group">
                            <pre className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto text-sm text-emerald-300 font-mono leading-relaxed">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                            <div className="absolute top-4 right-4 text-xs text-neutral-500">
                                {data.data?.length || 0} items
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
