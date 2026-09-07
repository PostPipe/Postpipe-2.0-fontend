'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ArrowUpRight,
    ExternalLink,
    BookOpen,
    Shield,
    Zap,
    LayoutDashboard,
    Copy,
    Check,
    Terminal,
    Sparkles,
    Database,
    Code2,
    Lock,
    Globe
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { DecryptedText } from '@/components/ui/decrypted-text';

interface RouteItem {
    name: string;
    path: string;
    description: string;
    status?: 'LIVE' | 'DOCS' | 'AUTH' | 'EXT';
    icon: React.ComponentType<{ className?: string }>;
    external?: boolean;
}

interface SitemapCategory {
    id: string;
    tag: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    routes: RouteItem[];
}

const SITEMAP_DATA: SitemapCategory[] = [
    {
        id: 'platform',
        tag: '01 // PLATFORM',
        name: 'Product & Platform',
        description: 'Core application engines, visual form builder, and telemetry analytics.',
        icon: LayoutDashboard,
        routes: [
            {
                name: 'Overview & Home',
                path: '/',
                description: 'Product introduction, real-time database demo, and architecture specs.',
                status: 'LIVE',
                icon: Globe
            },
            {
                name: 'Pricing & Compute',
                path: '/pricing',
                description: 'Submission volume tiers, pro features, and custom enterprise quotas.',
                status: 'LIVE',
                icon: Sparkles
            },
            {
                name: 'Mission Dashboard',
                path: '/dashboard',
                description: 'Manage active databases, connectors, API keys, and pipeline metrics.',
                status: 'LIVE',
                icon: LayoutDashboard
            },
            {
                name: 'Form Builder Studio',
                path: '/builder',
                description: 'Visual schema builder and code generator for frontend forms.',
                status: 'LIVE',
                icon: Code2
            },
            {
                name: 'Submissions Viewer',
                path: '/viewer',
                description: 'Live payload logs, analytics, and data submission streams.',
                status: 'LIVE',
                icon: Database
            }
        ]
    },
    {
        id: 'solutions',
        tag: '02 // INGESTION',
        name: 'Solutions & Ingestion',
        description: 'Static form engines, pre-built templates, and AI memory integrations.',
        icon: Zap,
        routes: [
            {
                name: 'Static Forms Engine',
                path: '/static',
                description: 'Zero-JS HTML form backend endpoints with instant email and webhook routing.',
                status: 'LIVE',
                icon: Terminal
            },
            {
                name: 'Templates & Explore',
                path: '/explore',
                description: 'Pre-designed component templates and fullstack integration starters.',
                status: 'LIVE',
                icon: Sparkles
            },
            {
                name: 'Kontext AI Engine',
                path: 'https://kontext.postpipe.in',
                description: 'Autonomous project memory and architectural knowledge engine for MCP.',
                status: 'EXT',
                icon: Zap,
                external: true
            }
        ]
    },
    {
        id: 'docs',
        tag: '03 // DEVELOPER',
        name: 'Developer Documentation',
        description: 'Technical manuals, API references, CLI toolkits, and database connector guides.',
        icon: BookOpen,
        routes: [
            {
                name: 'Docs Hub',
                path: '/docs',
                description: 'Complete guides for SDKs, REST endpoints, webhooks, and core concepts.',
                status: 'DOCS',
                icon: BookOpen
            },
            {
                name: 'Getting Started',
                path: '/docs/getting-started',
                description: 'Step-by-step onboarding to route your first submission in 60 seconds.',
                status: 'DOCS',
                icon: Terminal
            },
            {
                name: 'Database Connectors',
                path: '/docs/connectors',
                description: 'Integration guides for PostgreSQL, MongoDB, MySQL, Supabase, and webhooks.',
                status: 'DOCS',
                icon: Database
            },
            {
                name: 'CLI Reference',
                path: '/docs/cli',
                description: 'Command line utility to initialize, seed, and test endpoints locally.',
                status: 'DOCS',
                icon: Terminal
            }
        ]
    },
    {
        id: 'account',
        tag: '04 // SECURITY',
        name: 'Account & Security',
        description: 'Authentication gateways, token validation, and credential recovery.',
        icon: Shield,
        routes: [
            {
                name: 'Pilot Sign In',
                path: '/login',
                description: 'Access your Postpipe dashboard, API tokens, and connected databases.',
                status: 'AUTH',
                icon: Lock
            },
            {
                name: 'Verify Email',
                path: '/verify-email',
                description: 'Confirm account ownership and security tokens.',
                status: 'AUTH',
                icon: Shield
            },
            {
                name: 'Reset Password',
                path: '/reset-password',
                description: 'Request a secure password recovery link for your account.',
                status: 'AUTH',
                icon: Lock
            }
        ]
    }
];

export default function SitemapPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [copiedPath, setCopiedPath] = useState<string | null>(null);

    const handleCopy = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(path.startsWith('http') ? path : `https://postpipe.in${path}`);
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 1800);
    };

    const filteredCategories = useMemo(() => {
        return SITEMAP_DATA.map((category) => {
            if (activeTab !== 'all' && category.id !== activeTab) {
                return null;
            }

            const query = searchQuery.toLowerCase().trim();
            if (!query) return category;

            const matchesCategory =
                category.name.toLowerCase().includes(query) ||
                category.description.toLowerCase().includes(query);

            const matchingRoutes = category.routes.filter(
                (route) =>
                    route.name.toLowerCase().includes(query) ||
                    route.path.toLowerCase().includes(query) ||
                    route.description.toLowerCase().includes(query)
            );

            if (matchesCategory) return category;
            if (matchingRoutes.length > 0) {
                return {
                    ...category,
                    routes: matchingRoutes
                };
            }
            return null;
        }).filter(Boolean) as SitemapCategory[];
    }, [searchQuery, activeTab]);

    const totalRoutes = useMemo(() => {
        return SITEMAP_DATA.reduce((acc, cat) => acc + cat.routes.length, 0);
    }, []);

    return (
        <div className='min-h-screen w-full bg-black text-white px-4 sm:px-6 md:px-12 py-16 sm:py-24 relative selection:bg-purple-500/30'>
            {/* Subtle Grid Background Pattern */}
            <div
                className='absolute inset-0 pointer-events-none opacity-20'
                style={{
                    backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
                    backgroundSize: '48px 48px'
                }}
            />

            <div className='relative z-10 max-w-6xl mx-auto'>
                {/* Header with DecryptedText */}
                <div className='mb-12 pb-8 border-b border-neutral-800'>
                    <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
                        <div>
                            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3'>
                                <Terminal className='w-3.5 h-3.5' />
                                <span>DIRECTORY ATLAS</span>
                            </div>

                            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-space text-white mb-3'>
                                <DecryptedText
                                    text='Postpipe Sitemap'
                                    speed={40}
                                    maxIterations={8}
                                    className='text-white'
                                    encryptedClassName='text-purple-400'
                                />
                            </h1>

                            <p className='text-neutral-400 text-sm sm:text-base max-w-xl leading-relaxed'>
                                Comprehensive index of all product platforms, developer documentation, ingestion endpoints, and tools.
                            </p>
                        </div>

                        {/* Live Search */}
                        <div className='relative w-full md:w-80'>
                            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none' />
                            <input
                                type='text'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder='Search routes (e.g. /docs, /builder)...'
                                className='w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/60 font-mono transition-all backdrop-blur-md'
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-800'
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className='flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none'>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                                activeTab === 'all'
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                    : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
                            }`}
                        >
                            All Routes ({totalRoutes})
                        </button>
                        {SITEMAP_DATA.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                                    activeTab === cat.id
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                        : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories & Spotlight Cards */}
                <div className='space-y-12'>
                    <AnimatePresence mode='popLayout'>
                        {filteredCategories.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className='text-center py-16 px-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-400 text-sm'
                            >
                                No routes found matching &ldquo;{searchQuery}&rdquo;.
                            </motion.div>
                        ) : (
                            filteredCategories.map((category) => {
                                const CatIcon = category.icon;

                                return (
                                    <motion.section
                                        key={category.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className='space-y-4'
                                    >
                                        {/* Category Header */}
                                        <div className='flex items-center justify-between gap-4'>
                                            <div className='flex items-center gap-3'>
                                                <div className='p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400'>
                                                    <CatIcon className='w-4 h-4' />
                                                </div>
                                                <div>
                                                    <div className='flex items-center gap-2'>
                                                        <span className='text-[10px] font-mono font-bold text-purple-400 uppercase'>
                                                            {category.tag}
                                                        </span>
                                                    </div>
                                                    <h2 className='text-lg sm:text-xl font-bold text-white font-space'>
                                                        <DecryptedText
                                                            text={category.name}
                                                            speed={35}
                                                            maxIterations={6}
                                                            className='text-white font-bold'
                                                            encryptedClassName='text-purple-400'
                                                        />
                                                    </h2>
                                                </div>
                                            </div>

                                            <p className='text-xs text-neutral-500 hidden md:block max-w-sm text-right'>
                                                {category.description}
                                            </p>
                                        </div>

                                        {/* Route Cards Grid using ReactBits SpotlightCard */}
                                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'>
                                            {category.routes.map((route) => {
                                                const RouteIcon = route.icon;
                                                const isExternal = route.external || route.path.startsWith('http');
                                                const isCopied = copiedPath === route.path;

                                                return (
                                                    <Link
                                                        key={route.path}
                                                        href={route.path}
                                                        target={isExternal ? '_blank' : undefined}
                                                        rel={isExternal ? 'noopener noreferrer' : undefined}
                                                        className='group block h-full'
                                                    >
                                                        <SpotlightCard
                                                            className='h-full p-4 sm:p-5 flex flex-col justify-between border-neutral-800 bg-neutral-950/80 hover:border-purple-500/40 transition-all duration-200 rounded-2xl group'
                                                            spotlightColor='rgba(157, 78, 221, 0.16)'
                                                            spotlightSize={280}
                                                        >
                                                            <div>
                                                                {/* Top Row: Icon + Title + Status */}
                                                                <div className='flex items-start justify-between gap-3 mb-2'>
                                                                    <div className='flex items-center gap-2.5'>
                                                                        <div className='p-2 rounded-lg bg-neutral-900 border border-neutral-800 group-hover:border-purple-500/40 text-neutral-300 group-hover:text-purple-300 transition-colors'>
                                                                            <RouteIcon className='w-4 h-4' />
                                                                        </div>
                                                                        <h3 className='text-sm sm:text-base font-semibold text-white group-hover:text-purple-300 transition-colors'>
                                                                            {route.name}
                                                                        </h3>
                                                                    </div>

                                                                    <div className='flex items-center gap-1.5'>
                                                                        {route.status && (
                                                                            <span
                                                                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                                                                    route.status === 'LIVE'
                                                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                                        : route.status === 'DOCS'
                                                                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                                                                        : route.status === 'EXT'
                                                                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                                                }`}
                                                                            >
                                                                                {route.status}
                                                                            </span>
                                                                        )}
                                                                        {isExternal ? (
                                                                            <ExternalLink className='w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors' />
                                                                        ) : (
                                                                            <ArrowUpRight className='w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Description */}
                                                                <p className='text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-4'>
                                                                    {route.description}
                                                                </p>
                                                            </div>

                                                            {/* Bottom Row: Path & Copy Button */}
                                                            <div className='pt-2.5 border-t border-neutral-900 flex items-center justify-between gap-2 text-[11px] font-mono text-neutral-500 group-hover:text-purple-300/80 transition-colors'>
                                                                <span className='truncate'>{route.path}</span>
                                                                <button
                                                                    type='button'
                                                                    onClick={(e) => handleCopy(e, route.path)}
                                                                    title='Copy URL'
                                                                    className='p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors shrink-0'
                                                                >
                                                                    {isCopied ? (
                                                                        <Check className='w-3 h-3 text-emerald-400' />
                                                                    ) : (
                                                                        <Copy className='w-3 h-3' />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </SpotlightCard>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.section>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
