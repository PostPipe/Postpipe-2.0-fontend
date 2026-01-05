"use client";

import React, { useState, useEffect } from "react";
<<<<<<< HEAD
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
=======
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash, Database, Server, XCircle, Save } from "lucide-react";
import { getConnectorsAction } from "@/app/actions/dashboard";
import { addDatabaseAction, removeDatabaseAction } from "@/app/actions/connector-databases";
import { toast } from "@/hooks/use-toast";

type Connector = {
    id: string;
    name: string;
    url: string;
    databases?: Record<string, {
        uri: string;
        dbName: string;
    }>;
};

export default function DatabasePage() {
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [loading, setLoading] = useState(true);

    // Temp state for new database inputs: { [connectorId]: { uri: "", dbName: "" } }
    const [newDbInputs, setNewDbInputs] = useState<Record<string, { uri: string, dbName: string }>>({});

    useEffect(() => {
        fetchConnectors();
    }, []);

    const fetchConnectors = async () => {
        try {
            // We reuse the existing getConnectorsAction which calls getConnectors from server-db
            const res = await getConnectorsAction();
            // Map to our local strict type if needed, but the response should match
            setConnectors(res as any);
        } catch (error) {
            console.error("Failed to fetch connectors", error);
            toast({ title: "Error", description: "Failed to load connectors", variant: "destructive" });
>>>>>>> 3e6d6dc777d1b0acedc765b9e0880151889e9b2d
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
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
=======
    const handleInputChange = (connectorId: string, field: 'uri' | 'dbName', value: string) => {
        setNewDbInputs(prev => ({
            ...prev,
            [connectorId]: {
                ...(prev[connectorId] || { uri: "", dbName: "" }),
                [field]: value
            }
        }));
    };

    const handleAddDatabase = async (connectorId: string) => {
        const input = newDbInputs[connectorId];
        if (!input || !input.uri || !input.dbName) {
            toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
            return;
        }

        // Auto-generate alias from URI env var name
        // e.g., "MONGODB_URI_PRODUCTION" -> "production"
        const alias = input.uri.toLowerCase().replace(/^mongodb_uri_/i, '').replace(/_/g, '-') || input.uri.toLowerCase();

        try {
            const res = await addDatabaseAction(connectorId, alias, input.uri, input.dbName);
            if (res.success) {
                toast({ title: "Database Added", description: `Alias '${alias}' configured.` });

                // Clear inputs
                setNewDbInputs(prev => ({
                    ...prev,
                    [connectorId]: { uri: "", dbName: "" }
                }));

                // Refresh list
                fetchConnectors();
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to add database", variant: "destructive" });
        }
    };

    const handleRemoveDatabase = async (connectorId: string, alias: string) => {
        try {
            const res = await removeDatabaseAction(connectorId, alias);
            if (res.success) {
                toast({ title: "Database Removed" });
                fetchConnectors();
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove database", variant: "destructive" });
>>>>>>> 3e6d6dc777d1b0acedc765b9e0880151889e9b2d
        }
    };

    if (loading) {
        return (
<<<<<<< HEAD
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
=======
            <div className="flex h-full w-full items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
>>>>>>> 3e6d6dc777d1b0acedc765b9e0880151889e9b2d
            </div>
        );
    }

    return (
<<<<<<< HEAD
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
=======
        <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Database Configuration</h1>
                <p className="text-muted-foreground text-lg">
                    Manage database connections for each of your deployed connectors.
                </p>
            </div>

            {connectors.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
                    <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold">No Connectors Found</h3>
                    <p className="text-muted-foreground">You need to deploy a connector first.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {connectors.map((connector) => (
                        <Card key={connector.id} className="overflow-hidden border-2">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Server className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{connector.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{connector.id}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[300px]">{connector.url}</span>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {/* Existing Databases */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                                            <Database className="h-4 w-4" /> Configured Databases
                                        </h4>

                                        {!connector.databases || Object.keys(connector.databases).length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic pl-6">No extra databases configured.</p>
                                        ) : (
                                            <div className="grid gap-3 pl-2">
                                                {Object.entries(connector.databases).map(([alias, config]) => (
                                                    <div key={alias} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-all group">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">{alias}</span>
                                                                <span className="text-xs text-muted-foreground">→</span>
                                                                <span className="text-xs font-mono text-muted-foreground">{config.dbName}</span>
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[400px] opacity-70">
                                                                URI: {config.uri}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleRemoveDatabase(connector.id, alias)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add New Section */}
                                    <div className="bg-muted/20 p-4 rounded-xl border border-dashed">
                                        <h4 className="text-sm font-medium mb-3">Add New Database Alias</h4>
                                        <div className="flex flex-col md:flex-row gap-3 items-end">
                                            <div className="grid gap-1.5 flex-[2] w-full">
                                                <label className="text-xs font-medium text-muted-foreground">URI (or env:VAR_NAME)</label>
                                                <Input
                                                    placeholder="MONGODB_URI_PRODUCTION"
                                                    className="h-9 bg-background font-mono text-xs"
                                                    value={newDbInputs[connector.id]?.uri || ""}
                                                    onChange={e => handleInputChange(connector.id, 'uri', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-1.5 flex-1 w-full">
                                                <label className="text-xs font-medium text-muted-foreground">Database Name</label>
                                                <Input
                                                    placeholder="my_database"
                                                    className="h-9 bg-background"
                                                    value={newDbInputs[connector.id]?.dbName || ""}
                                                    onChange={e => handleInputChange(connector.id, 'dbName', e.target.value)}
                                                />
                                            </div>
                                            <Button size="sm" onClick={() => handleAddDatabase(connector.id)} className="h-9 px-4">
                                                Add <Plus className="ml-2 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
>>>>>>> 3e6d6dc777d1b0acedc765b9e0880151889e9b2d
        </div>
    );
}
