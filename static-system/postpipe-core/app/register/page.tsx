'use client';

import { useState } from 'react';
import { registerConnectorAction } from '../actions/register';
import Link from 'next/link';

export default function RegisterPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // @ts-ignore
        const formData = new FormData(e.currentTarget);
        const res = await registerConnectorAction(formData);

        setResult(res);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans flex items-center justify-center">
            <div className="max-w-xl w-full space-y-8">

                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Connect Your Bridge
                    </h1>
                    <p className="text-neutral-400">
                        Register your locally running connector to receive secure webhooks.
                    </p>
                </div>

                {!result?.success ? (
                    <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-6 shadow-2xl">
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Connector Name</label>
                            <input
                                name="name"
                                type="text"
                                defaultValue="My Local Connector"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-neutral-300 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Connector URL</label>
                            <input
                                name="url"
                                type="url"
                                defaultValue="http://localhost:3001"
                                placeholder="http://localhost:3001"
                                required
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-neutral-300 focus:border-emerald-500 outline-none font-mono text-sm"
                            />
                            <p className="text-xs text-neutral-500 mt-2">Ensure your connector is running on this URL.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Connecting...' : 'Generate Credentials'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 text-emerald-400 border-b border-neutral-800 pb-4">
                            <span className="text-2xl">🎉</span>
                            <h3 className="text-xl font-bold">Connector Registered!</h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-neutral-400">Update your <code>my-secure-bridge/.env</code> with these values:</p>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs uppercase font-bold text-neutral-600 tracking-wider">POSTPIPE_CONNECTOR_ID</label>
                                    <code className="block bg-black/50 p-3 rounded text-sm text-emerald-400 font-mono break-all select-all">
                                        {result.connectorId}
                                    </code>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-neutral-600 tracking-wider">POSTPIPE_CONNECTOR_SECRET</label>
                                    <div className="relative group">
                                        <code className="block bg-black/50 p-3 rounded text-sm text-amber-400 font-mono break-all select-all blur-sm group-hover:blur-0 transition-all">
                                            {result.connectorSecret}
                                        </code>
                                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-neutral-500 group-hover:hidden">Hover to Reveal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-neutral-800 flex gap-4">
                            <div className="text-xs text-yellow-500/80 bg-yellow-500/10 p-3 rounded flex-1">
                                ⚠️ Restart your connector after updating .env!
                            </div>
                            <Link href="/dashboard" className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-neutral-200 transition-colors flex items-center">
                                Go to Dashboard &rarr;
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
