'use client';

import { useState } from 'react';
import { submitMockForm } from '../../lib/demo-utils';
import Link from 'next/link';

export default function SubmitPage() {
    const [formId, setFormId] = useState('contact-us');
    const [jsonData, setJsonData] = useState('{\n  "email": "user@example.com",\n  "message": "Hello PostPipe!"\n}');

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let parsedData;
            try {
                parsedData = JSON.parse(jsonData);
            } catch (e) {
                throw new Error("Invalid JSON format");
            }

            const res = await submitMockForm(formId, parsedData);
            setResult(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-8">

                <header className="border-b border-neutral-800 pb-6">
                    <Link href="/dashboard" className="text-emerald-500 hover:text-emerald-400 text-sm mb-4 block">&larr; Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Simulate Form Submission
                    </h1>
                    <p className="text-neutral-400">
                        This page mimicks PostPipe Core sending a verified webhook to your connector.
                    </p>
                </header>

                {/* Form */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-white mb-1">Form ID</label>
                        <input
                            type="text"
                            value={formId}
                            onChange={(e) => setFormId(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-neutral-300 font-mono text-sm focus:border-emerald-500 outline-none"
                            placeholder="e.g. contact-us"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Check your dashboard for available forms or create a new one instantly.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-1">Submission Data (JSON)</label>
                        <textarea
                            value={jsonData}
                            onChange={(e) => setJsonData(e.target.value)}
                            rows={6}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-neutral-300 font-mono text-sm focus:border-emerald-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-white text-black font-bold rounded hover:bg-neutral-200 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Simulate Submission'}
                        </button>
                    </div>
                </div>

                {/* Result */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-medium">
                            <span>✅</span> Submission Received by Connector
                        </div>
                        <pre className="text-xs text-emerald-300 font-mono overflow-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                        <div className="pt-2">
                            <Link href="/dashboard" className="text-sm underline text-emerald-400 hover:text-emerald-300">
                                Go to Dashboard to view data &rarr;
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
