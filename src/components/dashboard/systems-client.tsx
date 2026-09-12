'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Boxes,
    Cpu,
    Sparkles,
    Check,
    Copy,
    Maximize2,
    Database,
    Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSystems } from '@/lib/actions/systems';
import { ExploreModal } from '@/components/explore/ExploreModal';
import { SystemsSkeleton } from '@/components/dashboard/systems-skeleton';
import { useTheme } from 'next-themes';

interface SystemItem {
    id: string;
    name: string;
    type: string;
    database: string;
    status: 'Active' | 'Disabled';
    environment: 'Dev' | 'Prod';
    lastUsed: string;
    isFavorite: boolean;
    image: string;
    author: { name: string; profileUrl?: string };
    tags: string[];
    cli?: string;
    aiPrompt?: string;
    npmPackageUrl?: string;
    databaseConfigurations?: {
        databaseName: string;
        logo: string;
        prompt: string;
    }[];
}

interface SystemsClientProps {
    initialSystems?: SystemItem[];
}

export default function SystemsClient({ initialSystems = [] }: SystemsClientProps) {
    const [systems, setSystems] = useState<SystemItem[]>(initialSystems);
    const [selectedSystem, setSelectedSystem] = useState<SystemItem | null>(null);
    const [loading, setLoading] = useState(initialSystems.length === 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedCliId, setCopiedCliId] = useState<string | null>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setMounted(true);
        // If initialSystems were not provided by SSR, fetch client-side as fallback
        if (initialSystems.length === 0) {
            const fetchSystems = async () => {
                try {
                    const data = await getSystems();
                    setSystems(data as SystemItem[]);
                } catch (e) {
                    console.error('Error fetching systems:', e);
                } finally {
                    setLoading(false);
                }
            };
            fetchSystems();
        }
    }, [initialSystems]);

    // Handle copying CLI
    const handleCopyCli = async (
        e: React.MouseEvent,
        cli: string | undefined,
        title: string,
        id: string
    ) => {
        e.stopPropagation();
        if (!cli) return;
        try {
            await navigator.clipboard.writeText(cli);
            setCopiedCliId(id);
            toast({
                title: 'CLI Copied!',
                description: `Copied initialization command for ${title}`,
            });
            setTimeout(() => setCopiedCliId(null), 2000);
        } catch {
            toast({
                title: 'Failed to copy',
                description: 'Please copy the command manually.',
                variant: 'destructive',
            });
        }
    };

    // Filtered systems based on search
    const filteredSystems = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return systems;

        return systems.filter((system) => {
            return (
                system.name.toLowerCase().includes(query) ||
                system.database.toLowerCase().includes(query) ||
                system.tags.some((t) => t.toLowerCase().includes(query))
            );
        });
    }, [systems, searchQuery]);

    // Stats calculations
    const stats = useMemo(() => {
        const total = systems.length;
        const active = systems.filter((s) => s.status === 'Active').length;
        const prod = systems.filter((s) => s.environment === 'Prod').length;
        return { total, active, prod };
    }, [systems]);

    if (loading) {
        return <SystemsSkeleton />;
    }

    return (
        <div className='flex flex-col gap-8 w-full max-w-7xl mx-auto'>
            {/* Hero Section - Performant Design */}
            <div className='relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-950 shadow-sm flex flex-col p-6 sm:p-10 md:p-14 gap-6'>


                {/* Ambient Glowing Orbs */}
                <div className="absolute -top-24 right-0 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-[100px] pointer-events-none z-0" />
                <div className="absolute -bottom-24 right-1/3 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[100px] pointer-events-none z-0" />

                {/* Concentric Circles Left Aligned */}
                <div 
                    className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[20%] pointer-events-none flex items-center justify-center z-0"
                    style={{ maskImage: 'radial-gradient(circle at center, black 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 75%)' }}
                >
                    <div className="w-[300px] h-[300px] rounded-full border border-neutral-900/10 dark:border-white/10 absolute shadow-[0_0_30px_rgba(157,78,221,0.1)] dark:shadow-[0_0_30px_rgba(157,78,221,0.2)] animate-[pulse_4s_ease-in-out_infinite]" />
                    <div className="w-[450px] h-[450px] rounded-full border border-neutral-900/10 dark:border-white/10 absolute border-dashed" />
                    <div className="w-[600px] h-[600px] rounded-full border border-neutral-900/10 dark:border-white/10 absolute" />
                    <div className="w-[750px] h-[750px] rounded-full border border-neutral-900/10 dark:border-white/10 absolute border-dashed" />
                    <div className="w-[900px] h-[900px] rounded-full border border-neutral-900/10 dark:border-white/10 absolute" />
                    <div className="w-[1050px] h-[1050px] rounded-full border border-neutral-900/10 dark:border-white/10 absolute border-dashed" />
                    <div className="w-[1200px] h-[1200px] rounded-full border border-neutral-900/10 dark:border-white/10 absolute" />
                    <div className="w-[1350px] h-[1350px] rounded-full border border-neutral-900/10 dark:border-white/10 absolute border-dashed" />
                </div>

                <div className='relative z-10 flex flex-col items-start gap-6'>
                    <div className='flex flex-col gap-3 relative z-10 max-w-3xl'>
                        {/* Pill Badge */}
                        <div className='inline-flex items-center rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-3 py-1 text-xs font-medium text-neutral-900 dark:text-white backdrop-blur-md w-fit mb-1'>
                            <span className='flex h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse' />
                            <span>Workspace • Forge 2.0</span>
                        </div>

                        {/* Title */}
                        <h1 className='text-4xl sm:text-6xl md:text-7xl font-black tracking-tight font-space text-neutral-900 dark:text-white drop-shadow-sm'>
                            Forge
                            <span className='text-primary'>.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className='text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl'>
                            Manage, inspect, and run your provisioned backend instances, databases, and microservices.
                        </p>

                        {/* Stats Row */}
                        <div className='flex flex-wrap items-center gap-3 pt-2'>
                            <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-mono'>
                                <Boxes className='w-3.5 h-3.5 text-primary' />
                                <span className='text-muted-foreground'>Installed:</span>
                                <span className='font-bold text-foreground'>{stats.total} Systems</span>
                            </div>

                            <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-mono'>
                                <span className='h-2 w-2 rounded-full bg-emerald-400' />
                                <span className='text-muted-foreground'>Status:</span>
                                <span className='font-bold text-emerald-500 dark:text-emerald-400'>
                                    {stats.active} Active
                                </span>
                            </div>

                            <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-mono'>
                                <Cpu className='w-3.5 h-3.5 text-purple-400' />
                                <span className='text-muted-foreground'>Prod Ready:</span>
                                <span className='font-bold text-foreground'>{stats.prod}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Action Controls */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
                {/* Search Input */}
                <div className='relative w-full sm:max-w-xs md:max-w-sm'>
                    <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
                    <input
                        type='text'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search installed systems...'
                        className='w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all'
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800'
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* New System Button */}
                <div className='flex items-center gap-2.5'>
                    <Link href='/explore' className='w-full sm:w-auto'>
                        <RainbowButton className='h-9 px-4 text-xs text-white w-full sm:w-auto flex items-center justify-center gap-1.5'>
                            <Plus className='h-3.5 w-3.5' />
                            <span>Add System from Catalog</span>
                        </RainbowButton>
                    </Link>
                </div>
            </div>

            {/* Systems Grid / Empty State */}
            {filteredSystems.length === 0 ? (
                <div className='text-center py-20 px-4 border border-dashed border-neutral-300 dark:border-white/10 rounded-2xl bg-neutral-50/50 dark:bg-white/[0.02]'>
                    <div className='p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-muted-foreground w-fit mx-auto mb-4'>
                        <Boxes className='w-8 h-8' />
                    </div>
                    <h3 className='text-lg font-bold text-foreground mb-1'>
                        {searchQuery
                            ? 'No matching systems found'
                            : 'No Backend Systems Added Yet'}
                    </h3>
                    <p className='text-muted-foreground text-sm max-w-md mx-auto mb-6'>
                        {searchQuery
                            ? `Try clearing your search query to see all installed systems.`
                            : `You haven't provisioned any backend systems yet. Browse our production-ready templates to deploy one instantly.`}
                    </p>
                    <Link href='/explore'>
                        <Button className='rounded-xl gap-2 shadow-md'>
                            <Sparkles className='w-4 h-4 text-purple-300' />
                            <span>Browse Template Marketplace</span>
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                    {filteredSystems.map((system, index) => {
                        const isCopied = copiedCliId === system.id;

                        return (
                            <div
                                key={system.id}
                                onClick={() => setSelectedSystem(system)}
                                className='cursor-pointer group h-full'
                            >
                                <SpotlightCard
                                    className='h-full flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md hover:border-primary/40 hover:shadow-xl transition-all duration-300'
                                    spotlightColor='rgba(157, 78, 221, 0.14)'
                                    spotlightSize={300}
                                >
                                    {/* Thumbnail Preview with Zoom */}
                                    <div className='aspect-[16/9] w-full relative overflow-hidden bg-neutral-950/20 border-b border-neutral-100 dark:border-white/5'>
                                        <Image
                                            src={system.image}
                                            alt={system.name}
                                            fill
                                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                            priority={index < 3}
                                            className='object-cover group-hover:scale-105 transition-transform duration-500'
                                        />
                                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity' />

                                        {/* Status & Environment Badges on Image */}
                                        <div className='absolute top-3 right-3 flex items-center gap-1.5 z-10'>
                                            <Badge
                                                variant='outline'
                                                className={`text-[10px] font-mono font-bold backdrop-blur-md shadow-sm border ${
                                                    system.status === 'Active'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                                        : 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40'
                                                }`}
                                            >
                                                {system.status}
                                            </Badge>
                                            <Badge
                                                variant='outline'
                                                className='text-[10px] font-mono bg-black/50 text-white border-white/20 backdrop-blur-md'
                                            >
                                                {system.environment}
                                            </Badge>
                                        </div>

                                        {/* Database Type Pill */}
                                        <div className='absolute bottom-2.5 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[10px] font-mono text-white/90 backdrop-blur-md'>
                                            <Database className='w-3 h-3 text-purple-400' />
                                            <span>{system.database}</span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className='p-5 flex-1 flex flex-col justify-between space-y-4'>
                                        <div className='space-y-3'>
                                            {/* Author Info */}
                                            <div className='flex items-center gap-2'>
                                                <Avatar className='h-5 w-5 border border-neutral-200 dark:border-white/10'>
                                                    <AvatarImage src={system.author.profileUrl} />
                                                    <AvatarFallback className='text-[9px] bg-primary/20 text-primary font-bold'>
                                                        {system.author.name.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className='text-xs text-muted-foreground font-medium truncate'>
                                                    {system.author.name}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className='text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1'>
                                                {system.name}
                                            </h3>

                                            {/* Tags */}
                                            <div className='flex flex-wrap gap-1.5 pt-0.5'>
                                                {system.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className='px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-[10px] font-medium text-muted-foreground'
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Card Action Footer */}
                                        <div className='pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between gap-2'>
                                            {system.cli ? (
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    onClick={(e) =>
                                                        handleCopyCli(e, system.cli, system.name, system.id)
                                                    }
                                                    className='h-8 text-xs font-mono flex-1 gap-1.5 border-neutral-200 dark:border-white/10 hover:border-primary/40'
                                                >
                                                    {isCopied ? (
                                                        <>
                                                            <Check className='w-3 h-3 text-emerald-400' />
                                                            <span className='text-emerald-400 font-semibold'>Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className='w-3 h-3 text-muted-foreground' />
                                                            <span>Copy CLI</span>
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                <div className='text-[11px] text-muted-foreground font-mono'>
                                                    Last used: {system.lastUsed}
                                                </div>
                                            )}

                                            <Button
                                                size='sm'
                                                variant='ghost'
                                                className='h-8 px-2.5 text-xs text-muted-foreground group-hover:text-foreground'
                                            >
                                                <Maximize2 className='w-3.5 h-3.5' />
                                            </Button>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detailed System Modal - Reusing ExploreModal */}
            <ExploreModal
                open={!!selectedSystem}
                onOpenChange={(open) => !open && setSelectedSystem(null)}
                item={
                    selectedSystem
                        ? {
                              id: selectedSystem.id,
                              title: selectedSystem.name,
                              category: selectedSystem.type,
                              author: {
                                  name: selectedSystem.author.name,
                                  avatar: selectedSystem.author.profileUrl,
                              },
                              image: selectedSystem.image,
                              tags: selectedSystem.tags,
                              cli: selectedSystem.cli,
                              aiPrompt: selectedSystem.aiPrompt,
                              npmPackageUrl: selectedSystem.npmPackageUrl,
                              databaseConfigurations: selectedSystem.databaseConfigurations || [
                                  {
                                      databaseName: selectedSystem.database,
                                      logo: 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/mongodb/mongodb.png',
                                      prompt: selectedSystem.aiPrompt || 'Connect database instance',
                                  },
                              ],
                          }
                        : null
                }
            />
        </div>
    );
}
