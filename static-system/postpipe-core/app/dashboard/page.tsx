'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardData, deleteFormAction, deleteConnectorAction } from '../actions/dashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const [forms, setForms] = useState<any[]>([]);
    const [connectors, setConnectors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await getDashboardData();
        // @ts-ignore
        setForms(data.forms);
        // @ts-ignore
        setConnectors(data.connectors);
        setLoading(false);
    };

    const handleDeleteForm = async (id: string) => {
        if (!confirm('Are you sure you want to delete this form?')) return;
        await deleteFormAction(id);
        loadData();
    };

    const handleDeleteConnector = async (id: string) => {
        if (!confirm('Delete this connector? WARNING: This will also delete all associated forms.')) return;
        await deleteConnectorAction(id);
        loadData();
    };

    if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-500">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-neutral-200">
            <div className="max-w-6xl mx-auto p-8 space-y-12">

                <header className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">PostPipe Dashboard</h1>
                        <p className="text-neutral-500">Manage your connectors and forms.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/register" className="px-5 py-2.5 border border-neutral-700 hover:bg-neutral-800 rounded-lg text-sm font-medium transition-colors">
                            🔌 Connect Bridge
                        </Link>
                        <Link href="/builder" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors text-white shadow-lg shadow-emerald-900/20">
                            + Create Form
                        </Link>
                    </div>
                </header>

                {/* Forms Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6">Your Forms</h2>
                    {forms.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-900/50 border border-neutral-800 rounded-xl border-dashed">
                            <h3 className="text-xl font-bold text-white mb-2">No Forms Yet</h3>
                            <p className="text-neutral-400 mb-6">Create your first form to start collecting data securely.</p>
                            <Link href="/builder" className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-neutral-200 transition-colors">
                                Build Your First Form
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {forms.map(form => (
                                <div key={form.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col lg:flex-row gap-8 lg:items-start group hover:border-neutral-700 transition-all relative">

                                    <button
                                        onClick={() => handleDeleteForm(form.id)}
                                        className="absolute top-4 right-4 text-neutral-600 hover:text-red-500 transition-colors p-2"
                                        title="Delete Form"
                                    >
                                        &times;
                                    </button>

                                    <div className="lg:w-1/4 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-white">{form.name}</h3>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
                                        </div>
                                        <p className="text-sm text-neutral-500 font-mono text-xs">ID: {form.id}</p>
                                        <div className="pt-4 flex flex-col gap-2">
                                            <button
                                                onClick={() => {
                                                    alert(`Use this action URL in your form:\nhttp://localhost:3000/api/public/submit/${form.id}`);
                                                }}
                                                className="text-xs text-left text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
                                            >
                                                📄 Get HTML Endpoint
                                            </button>
                                            <Link href={`/viewer?url=${encodeURIComponent(form.connectorGetterUrl)}&token=${form.readToken}`} className="text-xs text-left text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2">
                                                📊 View Data
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-neutral-600 tracking-wider mb-1 block">Your DB GET Endpoint</label>
                                                <code className="block bg-black/40 p-2.5 rounded text-xs text-emerald-400 break-all select-all font-mono border border-white/5">
                                                    {form.connectorGetterUrl}
                                                </code>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-neutral-600 tracking-wider mb-1 block">Read-Only Token</label>
                                                <div className="relative group/token">
                                                    <code className="block bg-black/40 p-2.5 rounded text-xs text-neutral-400 break-all select-all font-mono border border-white/5 blur-[2px] group-hover/token:blur-0 transition-all">
                                                        {form.readToken}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Connectors Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6">Your Connectors</h2>
                    {connectors.length === 0 ? (
                        <div className="py-8 text-neutral-500 text-sm">No connectors registered.</div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {connectors.map(conn => (
                                <div key={conn.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-white">{conn.name}</h4>
                                        <p className="text-xs text-neutral-500 font-mono mt-1">{conn.url}</p>
                                        <p className="text-xs text-neutral-600 font-mono mt-0.5">{conn.id}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteConnector(conn.id)}
                                        className="text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors border border-red-500/10"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
