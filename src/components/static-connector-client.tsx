"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Check, Copy, ExternalLink, Terminal, ArrowRight, ShieldCheck,
    AlertCircle, Eye, EyeOff, Loader2, Zap, Database, Server, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import NewFormClient from "@/components/dashboard/new-form-client";
import { registerConnectorAction, finalizeConnectorAction } from "@/app/actions/register";
import { ShaderAnimation } from "@/components/ui/shader-animation";

const STEPS = [
    { id: 1, label: "Generate", icon: Zap, desc: "Create secure credentials" },
    { id: 2, label: "Deploy", icon: Server, desc: "Push to the cloud" },
    { id: 3, label: "Connect", icon: Database, desc: "Link your instance" },
];

export default function StaticConnectorClient() {
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [connectorName, setConnectorName] = useState("");
    const [connectorData, setConnectorData] = useState<{ id: string; secret: string } | null>(null);
    const [deploymentUrl, setDeploymentUrl] = useState("");
    const [hasForked, setHasForked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isDashboardReady, setIsDashboardReady] = useState(false);

    useEffect(() => {
        if (user?.email) {
            const storedStep = localStorage.getItem(`pp_setup_step_${user.email}`);
            const storedData = localStorage.getItem(`pp_connector_data_${user.email}`);
            if (storedStep) setStep(parseInt(storedStep));
            if (storedData) setConnectorData(JSON.parse(storedData));
            if (storedStep === "4") setIsDashboardReady(true);
        }
    }, [user]);

    const saveState = (newStep: number, data?: any) => {
        if (user?.email) {
            localStorage.setItem(`pp_setup_step_${user.email}`, newStep.toString());
            if (data) localStorage.setItem(`pp_connector_data_${user.email}`, JSON.stringify(data));
        }
        setStep(newStep);
        if (data) setConnectorData(data);
    };

    const handleGenerate = async () => {
        if (!connectorName) {
            toast({ title: "Name Required", description: "Please give your connector a name.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const fd = new FormData();
        fd.append("name", connectorName);
        const res = await registerConnectorAction(fd);
        setIsLoading(false);
        if (res.success && res.connectorId && res.connectorSecret) {
            saveState(2, { id: res.connectorId, secret: res.connectorSecret });
            toast({ title: "Credentials Generated", description: "Now copy them to Vercel." });
        } else {
            toast({ title: "Error", description: res.error || "Failed to generate", variant: "destructive" });
        }
    };

    const handleConnect = async () => {
        if (!deploymentUrl || !connectorData) return;
        setIsLoading(true);
        const res = await finalizeConnectorAction(connectorData.id, deploymentUrl);
        setIsLoading(false);
        if (res.success) {
            saveState(4);
            setIsDashboardReady(true);
            toast({ title: "Connected!", description: "Your connector is live." });
        } else {
            toast({ title: "Connection Failed", description: res.error, variant: "destructive" });
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: `${label} copied.` });
    };

    if (showCreateForm) {
        return (
            <div className="pt-20 px-8">
                <NewFormClient onBack={() => setShowCreateForm(false)} />
            </div>
        );
    }

    const progress = isDashboardReady ? 100 : ((step - 1) / 3) * 100;

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-24">

            {/* Shader Background */}
            <ShaderAnimation />

            {/* Vignette: radial fade on all sides */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 65%, rgba(0,0,0,0.97) 85%, #000 100%)"
                }}
            />
            {/* Extra top/bottom darkening — heavier at bottom */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/80 via-transparent via-40% to-black" />
            {/* Extra bottom scrim for a feathered blur-like finish */}
            <div className="absolute bottom-0 left-0 right-0 h-48 z-0 pointer-events-none bg-gradient-to-t from-black to-transparent" />
            {/* Center base darkness so text stays readable */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-black/30" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-10">

                {/* Hero heading */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/60 backdrop-blur-sm">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400" />
                        </span>
                        Postpipe · Setup Wizard
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white leading-none drop-shadow-lg">
                        Connect Your<br />
                        <span className="bg-gradient-to-r from-violet-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent">
                            Database
                        </span>
                    </h1>
                    <p className="text-white/40 text-base max-w-sm mx-auto leading-relaxed">
                        Three steps to deploy your private Postpipe connector to any cloud.
                    </p>
                </div>

                {/* Step indicator */}
                {!isDashboardReady && (
                    <div className="flex items-center gap-2 w-full">
                        {STEPS.map((s, i) => {
                            const isActive = step === s.id;
                            const isDone = step > s.id;
                            return (
                                <div key={s.id} className="flex items-center flex-1 gap-2">
                                    <div className={cn(
                                        "flex items-center gap-2 rounded-xl px-3 py-2 border transition-all duration-300 flex-1",
                                        isDone ? "bg-violet-500/10 border-violet-500/20 text-violet-300" :
                                            isActive ? "bg-white/10 border-white/20 text-white" :
                                                "bg-white/[0.03] border-white/5 text-white/30"
                                    )}>
                                        <div className={cn(
                                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0",
                                            isDone ? "bg-violet-500/30 text-violet-300" :
                                                isActive ? "bg-white/20 text-white" :
                                                    "bg-white/5 text-white/20"
                                        )}>
                                            {isDone ? <Check className="h-3 w-3" /> : s.id}
                                        </div>
                                        <span className="text-xs font-semibold hidden sm:block">{s.label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={cn("h-px flex-shrink-0 w-4 transition-colors", step > s.id ? "bg-violet-500/40" : "bg-white/10")} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Main card */}
                <div className="w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">

                    {/* Progress bar */}
                    <div className="h-0.5 bg-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="p-8 space-y-6">

                        {/* ── Step 1: Generate ── */}
                        {step === 1 && !isDashboardReady && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Generate Credentials</h2>
                                    <p className="text-white/40 text-sm mt-1">Give your connector a name to create its secure identity.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Connector Name</label>
                                    <Input
                                        placeholder="e.g. My Production DB"
                                        value={connectorName}
                                        onChange={e => setConnectorName(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 focus-visible:ring-violet-500/20 h-11"
                                        onKeyDown={e => e.key === "Enter" && handleGenerate()}
                                    />
                                </div>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isLoading || !connectorName}
                                    className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-2 shadow-lg shadow-violet-900/30 transition-all"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-4 w-4" /> Generate Credentials</>}
                                </Button>
                            </div>
                        )}

                        {/* ── Step 2: Deploy ── */}
                        {step === 2 && !isDashboardReady && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Deploy to Cloud</h2>
                                    <p className="text-white/40 text-sm mt-1">Copy your credentials, fork the repo, and deploy.</p>
                                </div>

                                {/* Credentials block */}
                                {connectorData && (
                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Copy Before Continuing
                                        </div>
                                        <div className="relative group rounded-lg border border-white/5 bg-black/50 p-4">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                                                <Terminal className="h-3 w-3" /> Env Vars
                                            </div>
                                            <pre className="text-[11px] font-mono leading-relaxed text-emerald-300/80 overflow-x-auto">
                                                {`POSTPIPE_CONNECTOR_ID=${connectorData.id}\nPOSTPIPE_CONNECTOR_SECRET=`}<span className={cn(showSecret ? "" : "blur-[4px]")}>{connectorData.secret}</span>
                                            </pre>
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-white/30 hover:text-white hover:bg-white/10" onClick={() => setShowSecret(!showSecret)}>
                                                    {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-white/30 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(`POSTPIPE_CONNECTOR_ID=${connectorData.id}\nPOSTPIPE_CONNECTOR_SECRET=${connectorData.secret}`, "Credentials")}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Fork */}
                                <div className={cn("rounded-xl border p-4 flex items-center gap-4 transition-all", hasForked ? "border-white/5 bg-white/[0.02]" : "border-violet-500/30 bg-violet-500/[0.06]")}>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#24292e] text-white shrink-0">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-white">Fork the Template</p>
                                        <p className="text-xs text-white/40">Clone to your GitHub account</p>
                                    </div>
                                    <Button
                                        onClick={() => { setHasForked(true); window.open("https://github.com/Sourodip-1/postpipe-connector-template", "_blank"); }}
                                        size="sm"
                                        variant={hasForked ? "outline" : "default"}
                                        className={cn("shrink-0 gap-1.5 text-xs", hasForked ? "border-white/10 text-white/50 hover:text-white" : "bg-violet-600 hover:bg-violet-500 text-white")}
                                    >
                                        {hasForked ? <><Check className="h-3 w-3" /> Forked</> : <>Fork <ArrowRight className="h-3 w-3" /></>}
                                    </Button>
                                </div>

                                {/* Deploy targets */}
                                <div className={cn("grid grid-cols-2 gap-3 transition-all", !hasForked && "opacity-40 pointer-events-none blur-[1px]")}>
                                    {[
                                        { name: "Vercel", sub: "Recommended • Serverless", href: "https://vercel.com/new", logo: <svg viewBox="0 0 76 65" fill="currentColor" className="h-5 w-5"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" /></svg>, bg: "bg-black" },
                                        { name: "Azure / Cloud", sub: "Container • Node.js", href: "https://portal.azure.com/#create/Microsoft.WebSite", logo: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" /><line x1="8" y1="16" x2="8.01" y2="16" /><line x1="8" y1="20" x2="8.01" y2="20" /><line x1="12" y1="18" x2="12.01" y2="18" /><line x1="12" y1="22" x2="12.01" y2="22" /><line x1="16" y1="16" x2="16.01" y2="16" /><line x1="16" y1="20" x2="16.01" y2="20" /></svg>, bg: "bg-[#0078D4]" },
                                    ].map(p => (
                                        <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/10 p-5 text-center transition-all">
                                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-white transition-transform group-hover:scale-110", p.bg)}>
                                                {p.logo}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-white">{p.name}</p>
                                                <p className="text-[10px] text-white/30 mt-0.5">{p.sub}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                                {!hasForked && (
                                    <p className="text-center text-[11px] text-white/30 flex items-center justify-center gap-1.5">
                                        <AlertCircle className="h-3 w-3" /> Fork the repo above to unlock deployment options
                                    </p>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button variant="ghost" onClick={() => setStep(1)} className="text-white/40 hover:text-white hover:bg-white/5">Back</Button>
                                    <Button variant="outline" className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/5 gap-2" onClick={() => setStep(3)}>
                                        I've deployed it <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Connect ── */}
                        {step === 3 && !isDashboardReady && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Final Connection</h2>
                                    <p className="text-white/40 text-sm mt-1">Paste the URL Vercel or Azure provided after your deployment.</p>
                                </div>
                                <Input
                                    placeholder="https://my-connector.vercel.app"
                                    value={deploymentUrl}
                                    onChange={e => setDeploymentUrl(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 focus-visible:ring-violet-500/20 h-11"
                                />
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setStep(2)} className="text-white/40 hover:text-white hover:bg-white/5">Back</Button>
                                    <Button onClick={handleConnect} disabled={isLoading || !deploymentUrl} className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-2">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Lock className="h-4 w-4" /> Connect Instance</>}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* ── Complete ── */}
                        {isDashboardReady && (
                            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20 mx-auto shadow-[0_0_40px_rgba(52,211,153,0.15)]">
                                    <Check className="h-9 w-9 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">You're all set!</h2>
                                    <p className="text-white/40 text-sm mt-2 max-w-xs mx-auto">Your connector is live and ready to accept form submissions.</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button onClick={() => setShowCreateForm(true)} className="h-11 bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-2">
                                        <Zap className="h-4 w-4" /> Create Your First Form
                                    </Button>
                                    <Button variant="ghost" onClick={() => {
                                        if (user?.email) {
                                            localStorage.removeItem(`pp_setup_step_${user.email}`);
                                            setIsDashboardReady(false);
                                            setStep(1);
                                            setConnectorData(null);
                                        }
                                    }} className="text-white/30 hover:text-white hover:bg-white/5 text-xs">
                                        Set up another connector
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer hint */}
                {!isDashboardReady && (
                    <p className="text-center text-[11px] text-white/20">
                        Need help?{" "}
                        <Link href="/docs/guides/static-connector" className="underline underline-offset-2 hover:text-white/50 transition-colors">
                            Read the setup guide →
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
