"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Terminal, ArrowRight, ShieldCheck, Server, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import NewFormClient from "@/components/dashboard/new-form-client";

export default function StaticConnectorClient() {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);

    // New Registration State
    const [isFullyRegistered, setIsFullyRegistered] = useState(false);
    const [inputUrl, setInputUrl] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [connectorData, setConnectorData] = useState<{ id: string; secret: string } | null>(null);
    const [showSecret, setShowSecret] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const command = "npx create-postpipe-connector";

    useEffect(() => {
        if (user?.email) {
            const generated = localStorage.getItem(`postpipe_connector_generated_${user.email}`);
            const registered = localStorage.getItem(`postpipe_connector_registered_${user.email}`);
            const storedData = localStorage.getItem(`postpipe_connector_data_${user.email}`);

            if (generated === 'true') {
                setIsGenerated(true);
            }
            if (registered === 'true') {
                setIsFullyRegistered(true);
            }
            if (storedData) {
                setConnectorData(JSON.parse(storedData));
            }
        }
    }, [user]);

    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        if (user?.email) {
            localStorage.setItem(`postpipe_connector_generated_${user.email}`, 'true');
            setIsGenerated(true);
        }
    };

    const handleRegister = () => {
        if (!inputUrl) return;

        setIsRegistering(true);
        // Mock API Call
        setTimeout(() => {
            const newConnectorData = {
                id: `conn_${Math.random().toString(36).substring(2, 10)}`,
                secret: `sk_live_${Math.random().toString(36).substring(2)}`
            };
            setConnectorData(newConnectorData);
            setIsRegistering(false);

            if (user?.email) {
                localStorage.setItem(`postpipe_connector_registered_${user.email}`, 'true');
                localStorage.setItem(`postpipe_connector_data_${user.email}`, JSON.stringify(newConnectorData));
                setIsFullyRegistered(true);
            }

            toast({ title: "Connector Registered", description: "Your credentials have been generated." });
        }, 1500);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: `${label} copied to clipboard.` });
    };

    return (
        <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center pt-32 pb-12 px-4 sm:px-6 lg:px-8">

            {/* SECTION 1: Title & Context */}
            <div className="max-w-3xl w-full text-center mb-12 space-y-4">
                <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                    Prerequisite
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
                    Set up your PostPipe Connector
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    PostPipe Static requires a connector deployed in your infrastructure.
                    This connector owns your database credentials. <span className="text-foreground font-medium">PostPipe never sees them.</span>
                </p>
            </div>

            <div className="max-w-3xl w-full space-y-8">

                {!showCreateForm && (
                    <div className="space-y-8">

                        {/* SECTION 2: Step-by-Step Setup */}

                        {/* Complete State Header */}
                        {isFullyRegistered && (
                            <div className="max-w-3xl w-full text-center mb-8">
                                <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-8 mb-8 animate-in fade-in zoom-in duration-300">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                                        <Check className="h-6 w-6 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Connector Setup Complete</h3>
                                    <p className="text-muted-foreground mb-6">
                                        You have successfully configured your static connector.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (user?.email) {
                                                localStorage.removeItem(`postpipe_connector_registered_${user.email}`);
                                                localStorage.removeItem(`postpipe_connector_data_${user.email}`);
                                                setIsFullyRegistered(false);
                                                setConnectorData(null);
                                            }
                                        }}
                                        className="text-xs"
                                    >
                                        Reset Setup (Debug)
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            {/* Vertical Line - Only visible during setup steps 1 & 2 */}
                            {!isFullyRegistered && (
                                <div className="absolute left-6 top-4 bottom-4 w-px bg-border md:left-8 z-0"></div>
                            )}

                            {/* Step 1 & 2 - Only visible during setup */}
                            {!isFullyRegistered && (
                                <>
                                    {/* Step 1: Deploy CLI */}
                                    <div className="relative z-10 flex gap-6 mb-12">
                                        <div className={cn(
                                            "flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full border flex items-center justify-center font-mono font-bold text-lg md:text-xl shadow-sm transition-colors",
                                            isGenerated ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-background"
                                        )}>
                                            {isGenerated ? <Check className="h-6 w-6" /> : "1"}
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <h3 className="text-xl font-semibold mb-2">Generate Connector Locally</h3>

                                            {isGenerated ? (
                                                <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4 flex items-center gap-3">
                                                    <Check className="h-5 w-5 text-green-500" />
                                                    <p className="text-muted-foreground">
                                                        You have already generated the connector command.
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (user?.email) {
                                                                localStorage.removeItem(`postpipe_connector_generated_${user.email}`);
                                                                setIsGenerated(false);
                                                            }
                                                        }}
                                                        className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        Reset
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-muted-foreground mb-6">
                                                        Run this command locally to scaffold a new PostPipe connector project.
                                                    </p>

                                                    <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 font-mono text-sm flex items-center justify-between group">
                                                        <div className="flex items-center gap-3 text-zinc-100">
                                                            <Terminal className="h-4 w-4 text-zinc-500" />
                                                            <span>{command}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
                                                            onClick={handleCopy}
                                                        >
                                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </>
                                            )}


                                            {!isGenerated && (
                                                <div className="flex gap-4 mt-6">
                                                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" asChild>
                                                        <Link href="https://vercel.com/docs/deployments/overview" target="_blank">
                                                            Vercel Deploy
                                                            <svg role="img" viewBox="0 0 24 24" className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg"><title>Vercel</title><path d="M24 22.525H0l12-21.05 12 21.05z" /></svg>
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" asChild>
                                                        <Link href="https://en.wikipedia.org/wiki/Microsoft_Azure" target="_blank">
                                                            Azure Deploy
                                                            <img src="/Microsoft_Azure.logo.png" alt="Azure Logo" className="h-3 w-3 object-contain" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Step 2: Deploy to Platform */}
                                    <div className="relative z-10 flex gap-6 mb-12">
                                        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-background border flex items-center justify-center font-mono font-bold text-lg md:text-xl shadow-sm">
                                            2
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <h3 className="text-xl font-semibold mb-2">Deploy to Your Cloud</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Deploy the generated connector to Vercel, Azure, or AWS.
                                                Once deployed, you will receive a public URL.
                                            </p>

                                            <div className="bg-muted/50 rounded-none border p-3">
                                                <div className="text-xs text-muted-foreground uppercase font-semibold mb-2 tracking-wider">Output URL</div>
                                                <Input
                                                    placeholder="https://postpipe-connector-yourname.vercel.app"
                                                    className="font-mono text-sm bg-background border-none shadow-none rounded-none px-3 py-2 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/70"
                                                    value={inputUrl}
                                                    onChange={(e) => setInputUrl(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full mt-4 gap-2 text-muted-foreground group"
                                                onClick={handleRegister}
                                                disabled={isRegistering || !inputUrl || !!connectorData}
                                            >
                                                {isRegistering ? (
                                                    <>Registering <Loader2 className="h-4 w-4 animate-spin" /></>
                                                ) : connectorData ? (
                                                    <>Registered <Check className="h-4 w-4" /></>
                                                ) : (
                                                    <>Next <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 3: Get Connector Credentials - Always Visible (conditionally styled if registered?) */}
                            {/* If registered, we might want to hide the number '3' or change it to a generic icon, but sticking to structure for now unless requested. */}
                            <div className="relative z-10 flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-background border flex items-center justify-center font-mono font-bold text-lg md:text-xl shadow-sm">
                                    {isFullyRegistered ? <Check className="h-6 w-6 text-primary" /> : "3"}
                                </div>
                                <div className="flex-1 pt-2">
                                    <h3 className="text-xl font-semibold mb-2">Get Connector Credentials</h3>

                                    {!connectorData ? (
                                        <>
                                            <p className="text-muted-foreground mb-4">
                                                Enter your deployment URL above and click Next to generate your credentials.
                                            </p>
                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3 mb-4">
                                                <ShieldCheck className="h-5 w-5 text-amber-500 mt-0.5" />
                                                <div className="text-sm text-amber-500/90">
                                                    <strong>Security Note:</strong> No database credentials are shared. PostPipe only needs the URL to communicate.
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                            <p className="text-muted-foreground">
                                                Use these credentials to configure your connector.
                                            </p>

                                            {/* Connector ID */}
                                            <div className="space-y-1.5">
                                                <div className="text-xs font-medium text-muted-foreground">Connector ID</div>
                                                <div className="flex items-center gap-2">
                                                    <code className="relative rounded bg-muted px-[0.5rem] py-[0.35rem] font-mono text-sm font-semibold flex-1 border">
                                                        {connectorData.id}
                                                    </code>
                                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(connectorData.id, "Connector ID")}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Connector Secret */}
                                            <div className="space-y-1.5">
                                                <div className="text-xs font-medium text-muted-foreground">Connector Secret</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex-1 group">
                                                        <code className={cn("rounded bg-muted px-[0.5rem] py-[0.35rem] font-mono text-sm font-semibold block w-full truncate border", !showSecret && "blur-sm select-none")}>
                                                            {showSecret ? connectorData.secret : "sk_live_•••••••••••••••••••••"}
                                                        </code>
                                                        {!showSecret && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-transparent group-hover:bg-muted/10 transition cursor-pointer" onClick={() => setShowSecret(true)}>
                                                                <span className="sr-only">Show</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => setShowSecret(!showSecret)}>
                                                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(connectorData.secret, "Secret Key")} disabled={!showSecret}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3 mt-4">
                                                <Check className="h-4 w-4 text-green-600" />
                                                <div className="text-sm text-green-600 font-medium">
                                                    Connector Registered Successfully!
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator className="my-12" />

                        {/* SECTION 3: Continue to Dashboard */}
                        <div className="text-center space-y-6 bg-card border rounded-xl p-8 shadow-sm">
                            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <Server className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Ready to Create Forms?</h3>
                                <p className="text-muted-foreground max-w-lg mx-auto">
                                    Once you have your connector URL, proceed to the dashboard to generate your Connector ID & Secret.
                                </p>
                            </div>

                            <RainbowButton
                                className="w-auto px-10 gap-2 text-base h-12 mt-6"
                                onClick={() => setShowCreateForm(true)}
                            >
                                Create Forms <ArrowRight className="h-4 w-4" />
                            </RainbowButton>
                        </div>

                    </div>
                )}

                {showCreateForm && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <NewFormClient onBack={() => setShowCreateForm(false)} />
                    </div>
                )}
            </div>
        </div>
    );
}
