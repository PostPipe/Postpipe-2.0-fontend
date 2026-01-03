"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save, Trash } from "lucide-react";

interface DbConfig {
    uri: string;
    dbName: string;
}

interface DbRouteConfig {
    databases: Record<string, DbConfig>;
    rules: Array<{
        field: string;
        match: string;
        target: string;
    }>;
    defaultTarget: string;
}

export default function DatabasePage() {
    const [config, setConfig] = useState<DbRouteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/database/config");
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
            }
        } catch (error) {
            console.error("Failed to fetch database config", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await fetch("/api/database/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
        } catch (error) {
            console.error("Failed to save config", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Databases</h1>
                    <p className="text-muted-foreground">Manage your database connections and routing rules.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            {/* Default Target Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Default Configuration</CardTitle>
                    <CardDescription>Select the default database target for incoming submissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-medium">Default Target Name</label>
                        <input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={config?.defaultTarget || ""}
                            onChange={(e) => setConfig(prev => prev ? { ...prev, defaultTarget: e.target.value } : null)}
                            placeholder="e.g. default"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Databases List */}
            <Card>
                <CardHeader>
                    <CardTitle>Defined Databases</CardTitle>
                    <CardDescription>Define connection details for each target definition.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        {config?.databases && Object.entries(config.databases).map(([key, val]) => (
                            <div key={key} className="flex flex-col gap-2 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">{key}</h3>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        const newDbs = { ...config.databases };
                                        delete newDbs[key];
                                        setConfig({ ...config, databases: newDbs });
                                    }}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground">URI (or env:VAR_NAME)</label>
                                        <input
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={val.uri}
                                            onChange={(e) => {
                                                const newDbs = { ...config.databases };
                                                newDbs[key] = { ...newDbs[key], uri: e.target.value };
                                                setConfig({ ...config, databases: newDbs });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground">Database Name</label>
                                        <input
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={val.dbName}
                                            onChange={(e) => {
                                                const newDbs = { ...config.databases };
                                                newDbs[key] = { ...newDbs[key], dbName: e.target.value };
                                                setConfig({ ...config, databases: newDbs });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={() => {
                            const key = prompt("Enter new database target name (e.g. 'analytics'):");
                            if (key && config) {
                                setConfig({
                                    ...config,
                                    databases: {
                                        ...config.databases,
                                        [key]: { uri: "", dbName: "" }
                                    }
                                });
                            }
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Database Definition
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Routing Rules */}
            <Card>
                <CardHeader>
                    <CardTitle>Routing Rules</CardTitle>
                    <CardDescription>Route submissions to specific databases based on field values.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {config?.rules?.map((rule, idx) => (
                            <div key={idx} className="flex items-end gap-2 p-2 border rounded-md">
                                <div className="flex-1">
                                    <label className="text-xs">Field</label>
                                    <input className="w-full text-sm border rounded px-2 py-1" value={rule.field} onChange={(e) => {
                                        const newRules = [...(config.rules || [])];
                                        newRules[idx].field = e.target.value;
                                        setConfig({ ...config, rules: newRules });
                                    }} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs">Match (Regex)</label>
                                    <input className="w-full text-sm border rounded px-2 py-1" value={rule.match} onChange={(e) => {
                                        const newRules = [...(config.rules || [])];
                                        newRules[idx].match = e.target.value;
                                        setConfig({ ...config, rules: newRules });
                                    }} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs">Target</label>
                                    <input className="w-full text-sm border rounded px-2 py-1" value={rule.target} onChange={(e) => {
                                        const newRules = [...(config.rules || [])];
                                        newRules[idx].target = e.target.value;
                                        setConfig({ ...config, rules: newRules });
                                    }} />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    const newRules = config.rules.filter((_, i) => i !== idx);
                                    setConfig({ ...config, rules: newRules });
                                }}>
                                    <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => {
                            setConfig({
                                ...config!,
                                rules: [...(config?.rules || []), { field: "formName", match: ".*", target: "default" }]
                            });
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Rule
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
