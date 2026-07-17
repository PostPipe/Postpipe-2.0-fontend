"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash, Database, Server, Variable, Copy, Info } from "lucide-react";
import { getConnectorsAction } from "@/app/actions/dashboard";
import { addDatabaseAction, removeDatabaseAction } from "@/app/actions/connector-databases";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Aurora from "@/components/Aurora";
import { cn } from "@/lib/utils";

type Connector = {
    id: string;
    name: string;
    url: string;
    envPrefix?: string;
    databases?: Record<string, {
        uri: string;
        dbName: string;
        type?: 'mongodb' | 'postgres';
    }>;
};

export default function DatabasePage() {
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [loading, setLoading] = useState(true);

    const [newDbInputs, setNewDbInputs] = useState<Record<string, { uri: string, dbName: string, type: 'mongodb' | 'postgres' }>>({});

    useEffect(() => {
        fetchConnectors();
    }, []);

    const fetchConnectors = async () => {
        try {
            const res = await getConnectorsAction();
            setConnectors(res as any);
        } catch (error) {
            console.error("Failed to fetch connectors", error);
            toast({ title: "Error", description: "Failed to load connectors", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (connectorId: string, field: 'uri' | 'dbName' | 'type', value: string) => {
        setNewDbInputs(prev => ({
            ...prev,
            [connectorId]: {
                ...(prev[connectorId] || { uri: "", dbName: "", type: "mongodb" }),
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

        const alias = input.uri.toLowerCase().replace(/^mongodb_uri_/i, '').replace(/_/g, '-') || input.uri.toLowerCase();

        try {
            const res = await addDatabaseAction(connectorId, alias, input.uri, input.dbName, input.type);
            if (res.success) {
                toast({ title: "Database Added", description: `Alias '${alias}' configured as ${input.type}.` });
                setNewDbInputs(prev => ({
                    ...prev,
                    [connectorId]: { uri: "", dbName: "", type: "mongodb" }
                }));
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
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {/* ══ AURORA HEADER ══ */}
            <div className="relative w-full h-[280px] rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-[#060010]">
                <div className="absolute inset-0">
                    <Aurora
                        colorStops={["#5227FF", "#f248fe", "#5227FF"]}
                        amplitude={1}
                        blend={0.45}
                    />
                </div>

                {/* Overlay gradient to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060010]/90 via-[#060010]/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060010]/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                            <Database className="h-5 w-5" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
                            Databases
                        </h1>
                    </div>
                    <p className="text-lg text-white/80 max-w-xl font-medium drop-shadow">
                        Configure connection strings and aliases for multiple databases within your deployed connectors.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full">
                {connectors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card">
                        <div className="h-16 w-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border">
                            <Server className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">No Connectors Active</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm">Deploy a connector first to manage its database routing configurations.</p>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {connectors.map((connector) => (
                            <div key={connector.id} className="group relative rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden">

                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:px-8 md:py-6 border-b border-border bg-muted/20 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary shadow-inner">
                                            <Server className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold tracking-tight">{connector.name}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                                                <code className="text-xs bg-muted/80 border border-border px-1.5 py-0.5 rounded font-mono font-bold text-foreground">
                                                    {connector.id}
                                                </code>
                                                <span className="truncate max-w-[200px] md:max-w-sm">{connector.url}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {connector.envPrefix && (
                                        <Badge variant="outline" className="relative z-10 bg-background/50 backdrop-blur-sm border-primary/20 text-primary py-1.5 px-3 gap-2 shrink-0 rounded-full font-mono font-semibold">
                                            <Variable className="h-3.5 w-3.5" />
                                            Prefix: {connector.envPrefix}
                                        </Badge>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-6 md:p-8 grid gap-8 bg-background">

                                    {/* Configured DBs List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Database className="h-4 w-4 text-primary" />
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Configured Databases</h4>
                                        </div>

                                        {!connector.databases || Object.keys(connector.databases).length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-8 text-center">
                                                <p className="text-sm text-muted-foreground">No databases mapped for this connector.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-3">
                                                {Object.entries(connector.databases).map(([alias, config]) => (
                                                    <div key={alias} className="group/db flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
                                                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="font-bold text-sm bg-primary border border-primary text-primary-foreground px-2.5 py-0.5 rounded-md tracking-tight shadow-sm">
                                                                    {alias}
                                                                </span>
                                                                <span className="text-xs font-medium text-muted-foreground">routes to</span>
                                                                <span className="text-sm font-bold font-mono text-foreground truncate">
                                                                    {config.dbName}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="secondary" className={cn(
                                                                    "text-[10px] h-5 px-2 uppercase font-bold tracking-widest",
                                                                    config.type === 'postgres' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                )}>
                                                                    {config.type || 'mongodb'}
                                                                </Badge>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Variable className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    <code className="text-xs text-muted-foreground font-mono truncate max-w-[200px] md:max-w-md">
                                                                        {config.uri}
                                                                    </code>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 mt-2 md:mt-0">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 gap-1.5 text-xs text-foreground bg-background hover:bg-muted"
                                                                onClick={() => copyToClipboard(config.uri, "Variable Name")}
                                                            >
                                                                <Copy className="h-3.5 w-3.5" /> Copy Code
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                                                                onClick={() => handleRemoveDatabase(connector.id, alias)}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add New Form */}
                                    <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                                        <div className="flex items-center gap-3 mb-6 relative z-10">
                                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                                <Plus className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-foreground">Add Database Route</h4>
                                                <p className="text-xs font-medium text-muted-foreground mt-0.5">Map an environment variable URI to an internal database name.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end relative z-10">
                                            <div className="grid gap-2 md:col-span-5">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                                                        URI Variable Name
                                                    </label>
                                                    <div className="group/tooltip relative">
                                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-popover text-popover-foreground text-xs leading-relaxed rounded-lg shadow-xl border opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                                            Exact Vercel environment variable name that holds the connection string (e.g. MONGODB_URI_PROD).
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        <Variable className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                        placeholder="e.g. MONGODB_URI_PRODUCTION"
                                                        className="h-11 pl-9 bg-background font-mono text-sm border-primary/20 focus-visible:ring-primary shadow-sm"
                                                        value={newDbInputs[connector.id]?.uri || ""}
                                                        onChange={e => handleInputChange(connector.id, 'uri', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-2 md:col-span-3">
                                                <label className="text-[11px] font-bold uppercase tracking-widest text-foreground">DB Engine</label>
                                                <Select
                                                    value={newDbInputs[connector.id]?.type || "mongodb"}
                                                    onValueChange={val => handleInputChange(connector.id, 'type', val)}
                                                >
                                                    <SelectTrigger className="h-11 text-sm border-primary/20 bg-background shadow-sm">
                                                        <SelectValue placeholder="Engine" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="mongodb">MongoDB</SelectItem>
                                                        <SelectItem value="postgres">PostgreSQL</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-2 md:col-span-4">
                                                <label className="text-[11px] font-bold uppercase tracking-widest text-foreground">Target DB Name</label>
                                                <Input
                                                    placeholder="e.g. main_db"
                                                    className="h-11 bg-background text-sm border-primary/20 focus-visible:ring-primary shadow-sm"
                                                    value={newDbInputs[connector.id]?.dbName || ""}
                                                    onChange={e => handleInputChange(connector.id, 'dbName', e.target.value)}
                                                />
                                            </div>

                                            <div className="md:col-span-12 mt-2">
                                                <Button
                                                    onClick={() => handleAddDatabase(connector.id)}
                                                    className="h-11 w-full md:w-auto md:px-8 font-bold text-sm tracking-wide shadow-lg shadow-primary/20 gap-2"
                                                >
                                                    <Plus className="h-4 w-4" /> Map Database Route
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
}
