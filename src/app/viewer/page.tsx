'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function ViewerContent() {
    const searchParams = useSearchParams();

    const [url, setUrl] = useState('');
    const [token, setToken] = useState('');

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-fill from URL params if available (from Dashboard link)
    useEffect(() => {
        const pUrl = searchParams.get('url');
        const pToken = searchParams.get('token');
        if (pUrl) setUrl(pUrl);
        if (pToken) setToken(pToken);

        // Auto-fetch if both present? Maybe better to let user click "Fetch" to feel the control.
    }, [searchParams]);

    const fetchData = async () => {
        if (!url || !token) {
            setError("URL and Token are required");
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await fetch(url + '?limit=10', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                let msg = res.statusText;
                try {
                    const errJson = await res.json();
                    if (errJson.error) msg = errJson.error;
                } catch (e) { }
                throw new Error(`Failed: ${res.status} ${msg}`);
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
            <div className="max-w-4xl mx-auto space-y-8">

                <header className="border-b border-neutral-800 pb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        PostPipe <span className="text-emerald-400">Data Viewer</span>
                    </h1>
                    <p className="text-neutral-400">
                        Securely view form submissions from your connector without sharing credentials with PostPipe.
                    </p>
                </header>

                {/* Input Form */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">GET Endpoint</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="http://localhost:3001/api/postpipe/forms/..."
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-neutral-300 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Access Token</label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="pp_read_..."
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-neutral-300 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
                        >
                            {loading ? 'Fetching...' : 'Fetch Data'}
                        </button>
                    </div>
                </div>

                {/* Results Display */}
                <div className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            {error}
                        </div>
                    )}

                    {data && (
                        <div className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Response JSON</h3>
                                <div className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">
                                    {data.count || 0} Records
                                </div>
                            </div>
                            <pre className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto text-sm text-emerald-300 font-mono leading-relaxed shadow-xl">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

import { ViewerSkeleton } from '@/components/viewer-skeleton';

export default function ViewerPage() {
    return (
        <Suspense fallback={<ViewerSkeleton />}>
            <ViewerContent />
        </Suspense>
    );
}
