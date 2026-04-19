"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Plus, Terminal, RefreshCw, Eye, EyeOff, CheckCircle2, Zap, BrainCircuit, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { generatePikoApiKeyAction, revokePikoApiKeyAction, getPikoApiKeyAction } from "@/app/actions/piko";

export default function ApiClient() {
    const [pikoKey, setPikoKey] = useState<string | null>(null);
    const [showKey, setShowKey] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadKey = async () => {
            const key = await getPikoApiKeyAction();
            if (key) {
                setPikoKey(key);
            }
        };
        loadKey();
    }, []);

    const generateKey = async () => {
        setIsGenerating(true);
        const result = await generatePikoApiKeyAction();
        
        if (result.success && result.key) {
            setPikoKey(result.key);
            setShowKey(true);
            toast({
                title: "API Key Generated",
                description: "Your new Piko AI integration key is securely stored in your account.",
            });
        } else {
            toast({
                title: "Generation Failed",
                description: "Could not create Piko API key. Please try again.",
                variant: "destructive"
            });
        }
        setIsGenerating(false);
    };

    const copyToClipboard = () => {
        if (!pikoKey) return;
        navigator.clipboard.writeText(pikoKey);
        toast({
            title: "Copied!",
            description: "API key copied to clipboard.",
        });
    };

    const revokeKey = async () => {
        const result = await revokePikoApiKeyAction();
        if (result.success) {
            setPikoKey(null);
            toast({
                title: "Key Revoked",
                description: "Piko AI access has been permanently removed from your account.",
                variant: "destructive"
            });
        } else {
            toast({
                title: "Revocation Failed",
                description: "Could not revoke key. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">API & Integrations</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Piko AI Integration Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50 p-6 backdrop-blur-xl shadow-2xl"
                >
                    {/* Glowing effect background */}
                    <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] rounded-full bg-violet-500/20 blur-[120px] pointer-events-none" />
                    
                    <div className="flex flex-col h-full relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30">
                                <BrainCircuit className="w-6 h-6 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Piko AI Agent</h3>
                                <p className="text-sm text-zinc-400">Grant Piko AI access to your Postpipe account</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <p className="text-sm text-zinc-300 leading-relaxed">
                                Connect our agentic AI, Piko, directly to your workspace. Piko AI can manage forms, create connectors, 
                                and analyze your backend data autonomously. Generate a secure API key below to authorize Piko.
                            </p>

                            <div className="mt-8">
                                {!pikoKey ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-xl bg-white/5"
                                    >
                                        <Zap className="w-8 h-8 text-zinc-500 mb-3" />
                                        <p className="text-sm text-zinc-400 mb-4 text-center">No active integration key found.</p>
                                        <Button 
                                            onClick={generateKey} 
                                            disabled={isGenerating}
                                            className="bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]"
                                        >
                                            {isGenerating ? (
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="mr-2 h-4 w-4" />
                                            )}
                                            Generate Piko API Key
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }} 
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-violet-400" />
                                                <span className="text-sm font-medium text-violet-200">Piko AI Integration Active</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={revokeKey} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                                Revoke Access
                                            </Button>
                                        </div>

                                        <div className="space-y-2 flex flex-col">
                                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Secret Key</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input 
                                                        type={showKey ? "text" : "password"}
                                                        value={pikoKey}
                                                        readOnly
                                                        className="font-mono bg-black/40 border-white/10 text-zinc-300 pr-10 focus-visible:ring-violet-500/50"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 top-0 h-full px-3 text-zinc-400 hover:text-white"
                                                        onClick={() => setShowKey(!showKey)}
                                                    >
                                                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                                <Button size="icon" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" onClick={copyToClipboard}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                                                <ShieldAlert className="w-3 h-3" />
                                                Keep this key secret. Do not share it in public repositories.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* General REST API Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                    className="col-span-2 lg:col-span-1 relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50 p-6 backdrop-blur-xl flex flex-col"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 border border-white/10">
                            <Terminal className="w-5 h-5 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">REST API</h3>
                    </div>
                    
                    <p className="text-sm text-zinc-400 flex-1">
                        Use the Postpipe REST API to interact with your workspace programmatically. Endpoints are available for forms, submissions, and webhooks.
                    </p>
                    
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <Button variant="outline" className="w-full border-white/10 bg-transparent hover:bg-white/5 text-zinc-300">
                            View Documentation
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
