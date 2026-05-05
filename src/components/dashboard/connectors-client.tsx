"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Eye, EyeOff, Copy, RefreshCw, AlertTriangle,
    CheckCircle2, Trash2, Database, Globe, Lock, Zap,
    Plus, Shield, Server, Activity
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { registerConnectorAction } from "@/app/actions/register";
import { deleteConnectorAction } from "@/app/actions/dashboard";

type Connector = {
    id: string;
    name: string;
    secret: string;
    url: string;
    targetDatabase?: string;
    databases?: Record<string, { uri: string; dbName: string }>;
    envPrefix?: string;
    status: "Verified" | "Not Verified";
    lastUsed: string;
};

interface ConnectorsClientProps {
    initialConnectors: any[];
    databaseConfig?: any;
}

export default function ConnectorsClient({ initialConnectors, databaseConfig }: ConnectorsClientProps) {
    const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
    const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [envPrefix, setEnvPrefix] = useState("");
    const [targetDatabase, setTargetDatabase] = useState("default");
    const [isRegistering, setIsRegistering] = useState(false);

    const toggleSecret = (id: string) => {
        setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: `${label} copied to clipboard.` });
    };

    const deleteConnector = async (id: string, connectorId: string) => {
        try {
            setConnectors(prev => prev.filter(c => c.id !== id));
            await deleteConnectorAction(connectorId);
            toast({ title: "Connector Deleted", description: "The connector has been removed." });
        } catch {
            toast({ title: "Error", description: "Failed to delete connector", variant: "destructive" });
        }
    };

    const rotateSecret = (id: string) => {
        toast({ title: "Secret Rotated", description: "Previous secret is now invalid. Update your apps.", variant: "destructive" });
    };

    const handleRegisterConnector = async () => {
        if (!newName || !newUrl) return;
        setIsRegistering(true);
        const FormDataObj = new FormData();
        FormDataObj.append("name", newName);
        FormDataObj.append("url", newUrl);
        if (envPrefix) FormDataObj.append("envPrefix", envPrefix.toUpperCase());
        if (targetDatabase && targetDatabase !== "default") FormDataObj.append("targetDatabase", targetDatabase);
        try {
            const res = await registerConnectorAction(FormDataObj);
            if (res.error) {
                toast({ title: "Registration Failed", description: res.error, variant: "destructive" });
            } else {
                setConnectors(prev => [...prev, {
                    id: res.connectorId || "",
                    name: newName,
                    secret: res.connectorSecret || "",
                    url: newUrl,
                    envPrefix: envPrefix.toUpperCase() || undefined,
                    targetDatabase: targetDatabase === "default" ? undefined : targetDatabase,
                    status: "Verified",
                    lastUsed: "Just now",
                }]);
                setNewName(""); setNewUrl(""); setEnvPrefix("");
                setIsDialogOpen(false);
                toast({ title: "Connector Registered", description: "You can now use this connector in your forms." });
            }
        } catch {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setIsRegistering(false);
        }
    };

    const verifiedCount = connectors.filter(c => c.status === "Verified").length;

    return (
        <div className="flex flex-col gap-8">

            {/* ══ HERO HEADER ══ */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950 shadow-2xl">
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)`,
                        backgroundSize: "40px 40px"
                    }}
                />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-8 py-8">
                    <div className="flex flex-col gap-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60 w-fit backdrop-blur-sm">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                            </span>
                            {verifiedCount} of {connectors.length} connected
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-white">
                                Connectors<span className="text-indigo-400">.</span>
                            </h1>
                            <p className="mt-2 text-sm text-white/40 max-w-sm leading-relaxed">
                                Securely bridge your Postpipe forms to any database or backend service.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1">
                            {[
                                { icon: Database, label: `${connectors.length} Total`, color: "text-white/50" },
                                { icon: CheckCircle2, label: `${verifiedCount} Verified`, color: "text-emerald-400" },
                                { icon: Shield, label: "End-to-end encrypted", color: "text-indigo-400" },
                            ].map(s => (
                                <div key={s.label} className="flex items-center gap-1.5 text-[11px] font-medium">
                                    <s.icon className={cn("h-3.5 w-3.5", s.color)} />
                                    <span className={s.color}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 shrink-0">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <RainbowButton className="h-10 px-5 text-sm font-semibold gap-2 text-white">
                                    <Plus className="h-4 w-4" /> New Connector
                                </RainbowButton>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Register New Connector</DialogTitle>
                                    <DialogDescription>Enter the details of your deployed connector.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Connector Name</Label>
                                        <Input id="name" placeholder="e.g. Production Azure" value={newName} onChange={(e) => setNewName(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="url">Deployment URL</Label>
                                        <Input id="url" placeholder="https://my-connector.vercel.app" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="prefix">Variable Prefix (Optional)</Label>
                                        <Input id="prefix" placeholder="e.g. STAGING" value={envPrefix} onChange={(e) => setEnvPrefix(e.target.value.toUpperCase())} />
                                        <p className="text-[0.7rem] text-muted-foreground">Used to avoid environment variable conflicts in Vercel.</p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleRegisterConnector} disabled={isRegistering}>
                                        {isRegistering ? "Verifying..." : "Register Connector"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2.5 max-w-xs">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-amber-300/80 leading-relaxed">
                                Never share your secrets. Credentials never leave your infrastructure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ CONNECTOR CARDS ══ */}
            {connectors.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border bg-muted/20 py-24 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted shadow-xl">
                        <Database className="h-9 w-9 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-foreground">No connectors yet</p>
                        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">Register your first connector to route form submissions to any database.</p>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2 mt-2">
                        <Plus className="h-4 w-4" /> Register Connector
                    </Button>
                </div>
            ) : (
                <div className="grid gap-5">
                    {connectors.map((connector) => {
                        const isVerified = connector.status === "Verified";
                        const isVisible = visibleSecrets[connector.id];
                        const accentClass = isVerified ? "bg-emerald-500" : "bg-amber-500";
                        const glowClass = isVerified ? "from-emerald-500/5" : "from-amber-500/5";

                        return (
                            <div key={connector.id}
                                className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">

                                {/* Colored left accent stripe */}
                                <div className={cn("absolute left-0 inset-y-0 w-1", accentClass)} />

                                {/* Card Header */}
                                <div className={cn(
                                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-7 pr-6 py-4 border-b border-border",
                                    `bg-gradient-to-r ${glowClass} via-transparent to-transparent`
                                )}>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <div className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-lg border",
                                            isVerified ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"
                                        )}>
                                            <Server className={cn("h-4 w-4", isVerified ? "text-emerald-500" : "text-amber-500")} />
                                        </div>
                                        <h3 className="font-bold text-base text-foreground tracking-tight">{connector.name}</h3>
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border",
                                            isVerified
                                                ? "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10"
                                                : "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10"
                                        )}>
                                            {isVerified ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                            {connector.status}
                                        </span>
                                        {connector.targetDatabase && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/25 bg-blue-50 dark:bg-blue-500/10">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                {typeof connector.targetDatabase === 'string' ? connector.targetDatabase : (connector.targetDatabase as any)?.dbName || 'default'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
                                        <Activity className="h-3.5 w-3.5" />
                                        Last used:&nbsp;<span className="font-semibold text-foreground">{connector.lastUsed}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="pl-7 pr-6 py-5 grid gap-4 md:grid-cols-2">
                                    {/* Deployment URL */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Deployment URL</p>
                                        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5">
                                            <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                            <span className="text-sm font-mono text-muted-foreground truncate flex-1">{connector.url}</span>
                                        </div>
                                    </div>

                                    {/* Connector Secret */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Connector Secret</p>
                                        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5">
                                            <Lock className={cn("h-3.5 w-3.5 shrink-0", isVerified ? "text-emerald-500" : "text-amber-500")} />
                                            <code className={cn(
                                                "text-sm font-mono flex-1 truncate transition-all",
                                                isVisible ? "text-foreground" : "blur-[4px] select-none text-muted-foreground"
                                            )}>
                                                {isVisible ? connector.secret : "sk_live_•••••••••••••••••••••"}
                                            </code>
                                            <div className="flex gap-0.5 shrink-0">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => toggleSecret(connector.id)}>
                                                    {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" disabled={!isVisible} onClick={() => copyToClipboard(connector.secret, "Secret Key")}>
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1.5">Acts as the password for your connector.</p>
                                    </div>

                                    {/* Connector ID */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Connector ID</p>
                                        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5">
                                            <Database className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                                            <code className="text-sm font-mono text-foreground flex-1 truncate">{connector.id}</code>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(connector.id, "Connector ID")}>
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Vercel Env Vars — terminal block */}
                                <div className="pl-7 pr-6 pb-5">
                                    <div className="rounded-xl border border-border overflow-hidden">
                                        {/* Terminal titlebar */}
                                        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1.5">
                                                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                                                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-2">
                                                    <svg width="10" height="10" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="white" /></svg>
                                                    <span className="text-[11px] font-mono text-white/40">vercel.env</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 border border-white/10 rounded px-2 py-0.5">Recommended</span>
                                                <Button
                                                    variant="ghost" size="sm"
                                                    className="h-6 gap-1.5 text-[11px] text-white/50 hover:text-white hover:bg-white/10 px-2"
                                                    onClick={() => {
                                                        const vars = [
                                                            connector.envPrefix ? `POSTPIPE_VAR_PREFIX=${connector.envPrefix}` : "",
                                                            `${connector.envPrefix ? connector.envPrefix + "_" : ""}POSTPIPE_CONNECTOR_ID=${connector.id}`,
                                                            `${connector.envPrefix ? connector.envPrefix + "_" : ""}POSTPIPE_CONNECTOR_SECRET=${connector.secret}`
                                                        ].filter(Boolean).join("\n");
                                                        copyToClipboard(vars, "Vercel Variables");
                                                    }}>
                                                    <Copy className="h-3 w-3" /> Copy All
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Terminal body */}
                                        <div className="bg-neutral-950 px-4 py-3.5">
                                            <pre className="text-[11px] font-mono leading-6 overflow-x-auto">
                                                {connector.envPrefix && (
                                                    <span>
                                                        <span className="text-blue-400">POSTPIPE_VAR_PREFIX</span>
                                                        <span className="text-white/30">=</span>
                                                        <span className="text-emerald-400">{connector.envPrefix}</span>
                                                        {"\n"}
                                                    </span>
                                                )}
                                                <span>
                                                    <span className="text-blue-400">{connector.envPrefix ? connector.envPrefix + "_" : ""}POSTPIPE_CONNECTOR_ID</span>
                                                    <span className="text-white/30">=</span>
                                                    <span className="text-amber-300">{connector.id}</span>
                                                    {"\n"}
                                                </span>
                                                <span>
                                                    <span className="text-blue-400">{connector.envPrefix ? connector.envPrefix + "_" : ""}POSTPIPE_CONNECTOR_SECRET</span>
                                                    <span className="text-white/30">=</span>
                                                    <span className={cn("transition-all", isVisible ? "text-emerald-400" : "blur-[4px] text-emerald-400 select-none")}>
                                                        {isVisible ? connector.secret : "sk_live_•••••••••••••••••••••"}
                                                    </span>
                                                </span>
                                            </pre>
                                            <p className="text-[10px] mt-2 text-white/20 italic">Paste into Vercel Project Settings → Environment Variables.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pl-7 pr-6 py-3 border-t border-border bg-muted/20">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="text-muted-foreground hover:text-destructive text-xs h-8 gap-1.5">
                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Delete Connector?</DialogTitle>
                                                <DialogDescription>Are you sure you want to delete <strong>{connector.name}</strong>? This cannot be undone and any forms using this connector will stop working.</DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="outline">Cancel</Button>
                                                <Button variant="destructive" onClick={() => deleteConnector(connector.id, connector.id)}>Delete Connector</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="text-xs h-8 gap-1.5">
                                                <RefreshCw className="h-3.5 w-3.5" /> Rotate Secret
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Rotate Secret Key?</DialogTitle>
                                                <DialogDescription>This will invalidate the current secret for <strong>{connector.name}</strong>. All applications using this key will lose access until updated.</DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="outline">Cancel</Button>
                                                <Button variant="destructive" onClick={() => rotateSecret(connector.id)}>Yes, Rotate Secret</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
