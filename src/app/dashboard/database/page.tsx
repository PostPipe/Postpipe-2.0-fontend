"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash, Database, Server, Variable, Copy, Info, Search } from "lucide-react";
import { getConnectorsAction } from "@/app/actions/dashboard";
import { addDatabaseAction, removeDatabaseAction } from "@/app/actions/connector-databases";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";

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

    const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [newDbInputs, setNewDbInputs] = useState<Record<string, { uri: string, dbName: string, type: 'mongodb' | 'postgres' }>>({});
    const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

    // Hero Interactive State
    const heroRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const [clickWaves, setClickWaves] = useState<{ id: number, x: number, y: number }[]>([]);

    const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleHeroMouseLeave = () => {
        setMousePos({ x: -1000, y: -1000 });
    };

    const handleHeroClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        const newWave = {
            id: Date.now(),
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        setClickWaves(prev => [...prev.slice(-4), newWave]);
        setTimeout(() => {
            setClickWaves(prev => prev.filter(w => w.id !== newWave.id));
        }, 2000);
    };

    useEffect(() => {
        fetchConnectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchConnectors = async () => {
        try {
            const res = await getConnectorsAction();
            const fetched = res as Connector[];
            setConnectors(fetched);
            if (fetched.length > 0 && !selectedConnectorId) {
                setSelectedConnectorId(fetched[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch connectors", error);
            toast({ title: "Error", description: "Failed to load connectors", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const filteredConnectors = useMemo(() => {
        return connectors.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [connectors, searchQuery]);

    const activeConnector = useMemo(() => {
        return connectors.find(c => c.id === selectedConnectorId);
    }, [connectors, selectedConnectorId]);

    // Ensure we have a selected connector if the list changes
    useEffect(() => {
        if (connectors.length > 0 && !selectedConnectorId) {
            setSelectedConnectorId(connectors[0].id);
        }
    }, [connectors, selectedConnectorId]);

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
                setOpenDialogs(prev => ({ ...prev, [connectorId]: false }));
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
            {/* ══ HERO CARD ══ */}
            <div 
                ref={heroRef}
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={handleHeroMouseLeave}
                onClick={handleHeroClick}
                className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col lg:flex-row items-center justify-between p-6 lg:p-8 gap-6 lg:gap-10 mt-2 mb-4 group cursor-crosshair"
            >
                {/* Background subtle SVG pattern with 3D wave effect */}
                <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.5" className="fill-foreground" />
                            </pattern>
                            <radialGradient id="wave-gradient-1" r="35%">
                                <stop offset="0%" stopColor="white" stopOpacity="1" />
                                <stop offset="40%" stopColor="white" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                                <animate 
                                    attributeName="cx" 
                                    values="-20%; 120%; 120%; 120%" 
                                    keyTimes="0; 0.25; 0.5; 1" 
                                    dur="12s" 
                                    repeatCount="indefinite" 
                                />
                                <animate 
                                    attributeName="cy" 
                                    values="-20%; 120%; 120%; 120%" 
                                    keyTimes="0; 0.25; 0.5; 1" 
                                    dur="12s" 
                                    repeatCount="indefinite" 
                                />
                            </radialGradient>
                            <radialGradient id="wave-gradient-2" r="25%">
                                <stop offset="0%" stopColor="white" stopOpacity="1" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                                <animate 
                                    attributeName="cx" 
                                    values="120%; -20%; -20%; -20%" 
                                    keyTimes="0; 0.25; 0.5; 1" 
                                    dur="14s" 
                                    repeatCount="indefinite" 
                                />
                                <animate 
                                    attributeName="cy" 
                                    values="-20%; 120%; 120%; 120%" 
                                    keyTimes="0; 0.25; 0.5; 1" 
                                    dur="14s" 
                                    repeatCount="indefinite" 
                                />
                            </radialGradient>
                            <mask id="wave-mask">
                                <rect width="100%" height="100%" fill="url(#wave-gradient-1)" />
                                <rect width="100%" height="100%" fill="url(#wave-gradient-2)" />
                            </mask>
                            
                            {/* Hover Spotlight Mask */}
                            <radialGradient id="hover-spotlight" cx={mousePos.x} cy={mousePos.y} r="180" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="white" stopOpacity="1" />
                                <stop offset="50%" stopColor="white" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </radialGradient>
                            <mask id="hover-mask">
                                <rect width="100%" height="100%" fill="url(#hover-spotlight)" />
                            </mask>

                            {/* Click Waves Mask */}
                            <mask id="click-mask">
                                {clickWaves.map(wave => (
                                    <circle key={wave.id} cx={wave.x} cy={wave.y} r="0" fill="none" stroke="white" strokeWidth="50">
                                        <animate attributeName="r" from="0" to="600" dur="2s" fill="freeze" />
                                        <animate attributeName="stroke-width" from="50" to="0" dur="2s" fill="freeze" />
                                        <animate attributeName="opacity" from="1" to="0" dur="2s" fill="freeze" />
                                    </circle>
                                ))}
                            </mask>
                        </defs>
                        {/* Base faint grid */}
                        <rect width="100%" height="100%" fill="url(#grid-pattern)" className="opacity-5 dark:opacity-[0.03]" />
                        {/* Intense wave grid */}
                        <rect width="100%" height="100%" fill="url(#grid-pattern)" mask="url(#wave-mask)" className="opacity-40 dark:opacity-25" />
                        {/* Hover spotlight grid */}
                        <rect width="100%" height="100%" fill="url(#grid-pattern)" mask="url(#hover-mask)" className="opacity-70 dark:opacity-50 transition-opacity duration-300" />
                        {/* Click shockwave grid */}
                        <rect width="100%" height="100%" fill="url(#grid-pattern)" mask="url(#click-mask)" className="opacity-100" />
                    </svg>
                </div>

                <div className="relative z-10 max-w-lg w-full">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">
                        <Database className="h-3.5 w-3.5" />
                        <span>Database Routing</span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-3">
                        Connect multiple <br className="hidden md:block" /> databases dynamically.
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Map and configure distinct database connection strings and aliases for your deployed connectors. Segregate environments, tenants, or data zones without rewriting any server code.
                    </p>
                </div>

                {/* Animated SVG Graphic (Isometric) */}
                <div className="relative z-10 shrink-0 w-full max-w-[200px] md:max-w-[260px] lg:max-w-[320px] flex items-center justify-center -my-4 lg:mr-8">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="100 80 550 420" className="w-full h-auto drop-shadow-xl overflow-visible">
                        <defs>
                            {/* Define a reusable Satellite Server Node */}
                            <g id="satellite" className="stroke-foreground" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
                                {/* Dark Base */}
                                <polygon points="-40,-10 0,10 40,-10 40,-5 0,15 -40,-5" className="fill-foreground" />
                                
                                {/* Bottom Box */}
                                <polygon points="-40,-20 0,0 40,-20 0,-40" className="fill-muted" />
                                <polygon points="-40,-20 0,0 0,-15 -40,-35" className="fill-card" />
                                <polygon points="40,-20 0,0 0,-15 40,-35" className="fill-background" />
                                
                                {/* Top Box */}
                                <polygon points="-40,-45 0,-25 40,-45 0,-65" className="fill-muted" />
                                <polygon points="-40,-45 0,-25 0,-35 -40,-55" className="fill-card" />
                                <polygon points="40,-45 0,-25 0,-35 40,-55" className="fill-background" />
                                
                                {/* Top Inner Detail */}
                                <polygon points="-25,-45 0,-32.5 25,-45 0,-57.5" className="fill-border stroke-foreground" strokeWidth="1.5"/>
                                {/* Vertical Lines */}
                                <line x1="-40" y1="-55" x2="-40" y2="-85" className="stroke-foreground" strokeWidth="1.5" />
                                <line x1="40" y1="-55" x2="40" y2="-85" className="stroke-foreground" strokeWidth="1.5" />
                            </g>
                        </defs>

                        {/* Background Lines / Data Tracks */}
                        <g className="stroke-muted-foreground/60" strokeWidth="2" strokeDasharray="6,6" fill="none" strokeLinejoin="round">
                            <path id="track1" d="M 250 350 L 150 300 L 100 325 L 200 375" />
                            <path id="track2" d="M 450 250 L 550 200 L 600 225 L 500 275" />
                            <path id="track3" d="M 350 420 L 450 470 L 550 420 L 600 445" />
                        </g>

                        {/* Track Nodes (Static Dots) */}
                        <g className="stroke-foreground" strokeWidth="2">
                            <circle cx="150" cy="300" r="5" className="fill-destructive" />
                            <circle cx="550" cy="200" r="5" className="fill-primary" />
                            <circle cx="450" cy="470" r="5" className="fill-emerald-500" />
                        </g>

                        {/* Animated Data Packets */}
                        <g>
                            <circle r="4.5" className="fill-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                            <animateMotion dur="3s" repeatCount="indefinite" path="M 250 350 L 150 300 L 100 325 L 200 375" />
                            </circle>
                            <circle r="4.5" className="fill-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                            <animateMotion dur="4s" repeatCount="indefinite" path="M 450 250 L 550 200 L 600 225 L 500 275" />
                            </circle>
                            <circle r="4.5" className="fill-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                            <animateMotion dur="3.5s" repeatCount="indefinite" path="M 350 420 L 450 470 L 550 420 L 600 445" />
                            </circle>
                        </g>

                        {/* Main Central Server */}
                        <g className="stroke-foreground" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
                            {/* Main Chassis: Top, Left, Right */}
                            <polygon points="350,200 250,150 350,100 450,150" className="fill-background" />
                            <polygon points="350,420 250,370 250,150 350,200" className="fill-card" />
                            <polygon points="350,420 450,370 450,150 350,200" className="fill-muted" />
                            
                            {/* Outer Shell Bezel Detail */}
                            <path d="M 260 160 L 350 205 L 440 160" fill="none" className="stroke-border" strokeWidth="2"/>
                            <path d="M 350 205 L 350 405" fill="none" className="stroke-border" strokeWidth="2"/>

                            {/* Left Face: Server Slots */}
                            <g className="fill-muted">
                            <polygon points="265,180 335,215 335,245 265,210" />
                            <polygon points="265,230 335,265 335,295 265,260" />
                            <polygon points="265,280 335,315 335,345 265,310" />
                            <polygon points="265,330 335,365 335,395 265,360" />
                            </g>

                            {/* Slot Indicators (Lights) */}
                            <g stroke="none">
                            <ellipse cx="315" cy="225" rx="3" ry="1.5" transform="rotate(26.5 315 225)" className="fill-destructive" />
                            <ellipse cx="315" cy="275" rx="3" ry="1.5" transform="rotate(26.5 315 275)" className="fill-emerald-500" />
                            <ellipse cx="315" cy="325" rx="3" ry="1.5" transform="rotate(26.5 315 325)" className="fill-primary" />
                            <ellipse cx="315" cy="375" rx="3" ry="1.5" transform="rotate(26.5 315 375)" className="fill-destructive" />
                            </g>

                            {/* Right Face: Data Chart */}
                            <polygon points="375,225 435,195 435,275 375,305" className="fill-card" />
                            <g className="fill-muted-foreground/40" stroke="none">
                            <polygon points="385,295 392,291.5 392,250 385,253.5" />
                            <polygon points="400,287.5 407,284 407,220 400,223.5" />
                            <polygon points="415,280 422,276.5 422,240 415,243.5" />
                            </g>
                        </g>

                        {/* Satellite Nodes */}
                        <use href="#satellite" x="150" y="380" />
                        <use href="#satellite" x="550" y="275" />
                        <use href="#satellite" x="600" y="445" />
                    </svg>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full">
                {connectors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card">
                        <div className="h-16 w-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border">
                            <Server className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">No Connectors Active</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm">Deploy a connector first to manage its database routing configurations.</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                        
                        {/* Master Column (Left Sidebar for Connectors) */}
                        <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4 shrink-0 h-[400px] lg:h-[650px]">
                            <div className="relative shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search connectors..." 
                                    className="pl-9 bg-card border-border shadow-sm rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <ScrollArea className="flex-1 rounded-xl border border-border bg-card shadow-sm p-3">
                                <div className="flex flex-col gap-2">
                                    {filteredConnectors.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-muted-foreground">
                                            No connectors match your search.
                                        </div>
                                    ) : (
                                        filteredConnectors.map((connector) => (
                                            <button
                                                key={connector.id}
                                                onClick={() => setSelectedConnectorId(connector.id)}
                                                className={cn(
                                                    "flex flex-col items-start gap-1 p-4 rounded-xl text-left transition-all border",
                                                    selectedConnectorId === connector.id 
                                                        ? "bg-accent border-border shadow-sm text-accent-foreground font-semibold" 
                                                        : "bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5 w-full">
                                                    <Server className={cn("h-4 w-4 shrink-0", selectedConnectorId === connector.id ? "text-foreground" : "text-muted-foreground")} />
                                                    <span className="font-bold truncate text-sm">
                                                        {connector.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 w-full mt-1">
                                                    <code className="text-[10px] bg-muted border border-border/50 px-1.5 py-0.5 rounded font-mono font-medium text-muted-foreground shrink-0">
                                                        {connector.id}
                                                    </code>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Detail Column (Right Panel for Databases) */}
                        <div className="flex-1 w-full min-w-0 h-[500px] lg:h-[650px]">
                            {!activeConnector ? (
                                <div className="flex h-full flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card">
                                    <Database className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                                    <h3 className="text-xl font-bold tracking-tight text-foreground">Select a Connector</h3>
                                    <p className="text-muted-foreground text-sm mt-2 max-w-sm">Choose a connector from the list to manage its mapped databases.</p>
                                </div>
                            ) : (
                            <div className="relative h-full rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                
                                {/* Connector Detail Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border bg-muted/20 shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <Server className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold tracking-tight truncate text-foreground">{activeConnector.name}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <code className="bg-muted border border-border px-1.5 py-0.5 rounded font-mono font-medium text-foreground shrink-0">
                                                    {activeConnector.id}
                                                </code>
                                                <span className="truncate max-w-[200px] md:max-w-sm">{activeConnector.url}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {activeConnector.envPrefix && (
                                        <Badge variant="outline" className="text-muted-foreground font-mono font-medium shrink-0">
                                            <Variable className="h-3.5 w-3.5 mr-1.5" />
                                            Prefix: {activeConnector.envPrefix}
                                        </Badge>
                                    )}
                                </div>

                                <ScrollArea className="flex-1 w-full">
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Database className="h-4 w-4 text-muted-foreground" />
                                            <h4 className="text-sm font-semibold text-foreground">Mapped Databases</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                            
                                            {/* Existing DB Mappings */}
                                            {activeConnector.databases && Object.entries(activeConnector.databases).map(([alias, config]) => (
                                                <div key={alias} className="group/db flex flex-col justify-between gap-4 p-5 rounded-xl border border-border bg-card shadow-xs hover:border-border/80 transition-colors h-full">
                                                    <div className="flex flex-col gap-3 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span 
                                                                title={alias}
                                                                className="font-medium text-sm text-foreground truncate min-w-0 max-w-full"
                                                            >
                                                                {alias}
                                                            </span>
                                                            <Badge variant="secondary" className={cn(
                                                                "text-[10px] uppercase font-semibold tracking-wide shrink-0",
                                                                config.type === 'postgres' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                            )}>
                                                                {config.type || 'mongodb'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Target Database</span>
                                                            <span className="text-sm font-medium font-mono text-foreground truncate">
                                                                {config.dbName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border border-border overflow-hidden mt-1">
                                                            <Variable className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            <code className="text-xs text-muted-foreground font-mono truncate w-full">
                                                                {config.uri}
                                                            </code>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-auto pt-4">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-xs text-foreground shadow-xs"
                                                            onClick={() => copyToClipboard(config.uri, "Variable Name")}
                                                        >
                                                            <Copy className="h-3.5 w-3.5" /> Copy Code
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the database mapping for <strong>{alias}</strong> from this connector.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction 
                                                                        onClick={() => handleRemoveDatabase(activeConnector.id, alias)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Database Card Trigger */}
                                            <Dialog 
                                                open={openDialogs[activeConnector.id] || false} 
                                                onOpenChange={(open) => {
                                                    setOpenDialogs(prev => ({ ...prev, [activeConnector.id]: open }));
                                                    if (!open) {
                                                        setNewDbInputs(prev => ({
                                                            ...prev,
                                                            [activeConnector.id]: { uri: "", dbName: "", type: "mongodb" }
                                                        }));
                                                    }
                                                }}
                                            >
                                                <DialogTrigger asChild>
                                                    <button className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-border bg-card hover:bg-muted/50 hover:border-muted-foreground/30 transition-all text-muted-foreground hover:text-foreground cursor-pointer min-h-[160px] h-full group">
                                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:scale-105 transition-transform">
                                                            <Plus className="h-5 w-5" />
                                                        </div>
                                                        <div className="text-center space-y-0.5">
                                                            <div className="font-semibold text-sm text-foreground">Map Another Database</div>
                                                            <div className="text-xs">Add a new routing configuration</div>
                                                        </div>
                                                    </button>
                                                </DialogTrigger>
                                                
                                                <DialogContent className="sm:max-w-[450px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Map Database Route</DialogTitle>
                                                        <DialogDescription>
                                                            Map an environment variable URI to an internal database name for <strong>{activeConnector.name}</strong>.
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="grid gap-6 py-4">
                                                        <div className="grid gap-2">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-xs font-semibold text-foreground">
                                                                    URI Variable Name
                                                                </label>
                                                                <span className="text-[10px] text-muted-foreground">Vercel ENV var</span>
                                                            </div>
                                                            <div className="relative">
                                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                                    <Variable className="h-4 w-4" />
                                                                </div>
                                                                <Input
                                                                    placeholder="e.g. MONGODB_URI_PRODUCTION"
                                                                    className="pl-9 font-mono text-sm"
                                                                    value={newDbInputs[activeConnector.id]?.uri || ""}
                                                                    onChange={e => handleInputChange(activeConnector.id, 'uri', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <label className="text-xs font-semibold text-foreground">DB Engine</label>
                                                            <Select
                                                                value={newDbInputs[activeConnector.id]?.type || "mongodb"}
                                                                onValueChange={val => handleInputChange(activeConnector.id, 'type', val)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Engine" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="mongodb">MongoDB</SelectItem>
                                                                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <label className="text-xs font-semibold text-foreground">Target DB Name</label>
                                                            <Input
                                                                placeholder="e.g. main_db"
                                                                className="text-sm"
                                                                value={newDbInputs[activeConnector.id]?.dbName || ""}
                                                                onChange={e => handleInputChange(activeConnector.id, 'dbName', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-end pt-2">
                                                        <Button onClick={() => handleAddDatabase(activeConnector.id)}>
                                                            Map Database
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                        </div>
                                    </div>
                                </ScrollArea>
                                </div>
                            )}
                        </div>

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
