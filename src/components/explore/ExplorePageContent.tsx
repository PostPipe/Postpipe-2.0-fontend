'use client';

import { ExploreModal } from './ExploreModal';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { GridPattern } from '@/components/ui/grid-pattern';
import { ShinyText } from '@/components/ui/shiny-text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ChevronLeft,
    ChevronRight,
    Terminal,
    Maximize2,
    Sparkles,
    Check,
    Layers,
    Boxes,
    Cpu,
    Flame,
} from 'lucide-react';
import {
    getCatalogItemByIndex,
} from '@/lib/actions/explore';
import { useToast } from '@/hooks/use-toast';
import { createSystem } from '@/lib/actions/systems';
import { cn } from '@/lib/utils';

interface TemplateItem {
    _id: string;
    name: string;
    slug: string;
    category: string;
    tags: string[];
    author: { name: string; profileUrl?: string };
    thumbnailUrl: string;
    demoGifUrl: string;
    isPublished?: boolean;
    cli?: string;
    aiPrompt?: string;
    npmPackageUrl?: string;
    databaseConfigurations?: {
        databaseName: string;
        logo: string;
        prompt: string;
    }[];
}

interface ExplorePageContentProps {
    masterTemplate?: TemplateItem | null;
    initialFirstCard?: TemplateItem | null;
    initialCatalogTotalCount?: number;
    availableCategories?: string[];
    searchQuery?: string;
    selectedCategory?: string;
    selectedTag?: string;
}

export function ExplorePageContent({
    masterTemplate,
    initialFirstCard,
    initialCatalogTotalCount = 0,
    availableCategories = [],
    searchQuery,
    selectedCategory: initialCategory,
    selectedTag,
}: ExplorePageContentProps) {
    const { toast } = useToast();

    // Dynamic Category Filter Chips from DB
    const categoryTabs = React.useMemo(() => {
        const tabs = [{ label: 'All', value: '' }];
        if (availableCategories && availableCategories.length > 0) {
            availableCategories.forEach((cat) => {
                if (cat && !tabs.some((t) => t.value.toLowerCase() === cat.toLowerCase())) {
                    tabs.push({ label: cat, value: cat });
                }
            });
        } else {
            tabs.push(
                { label: 'Authentication', value: 'Authentication' },
                { label: 'Databases', value: 'Databases' },
                { label: 'AI & Agents', value: 'AI' },
                { label: 'Microservices', value: 'Microservices' },
            );
        }
        return tabs;
    }, [availableCategories]);

    // Active Category Filter
    const [activeCategory, setActiveCategory] = React.useState<string>(
        initialCategory || '',
    );
    const [currentIndex, setCurrentIndex] = React.useState<number>(0);
    const [totalCount, setTotalCount] = React.useState<number>(
        initialCatalogTotalCount,
    );
    const [currentCard, setCurrentCard] = React.useState<TemplateItem | null>(
        initialFirstCard || null,
    );
    const [loadingCard, setLoadingCard] = React.useState<boolean>(false);
    const [direction, setDirection] = React.useState<number>(0);

    // Selected item for full modal
    const [selectedItem, setSelectedItem] = React.useState<TemplateItem | null>(
        null,
    );
    const [copiedCliId, setCopiedCliId] = React.useState<string | null>(null);

    // In-memory cache for visited catalog cards: key is `${category}_${index}`
    const cacheRef = React.useRef<Map<string, TemplateItem>>(new Map());
    const totalCountCacheRef = React.useRef<Map<string, number>>(new Map());

    React.useEffect(() => {
        if (initialFirstCard) {
            cacheRef.current.set(
                `${initialCategory || ''}_0`,
                initialFirstCard,
            );
            totalCountCacheRef.current.set(
                `${initialCategory || ''}`,
                initialCatalogTotalCount,
            );
        }
    }, [initialFirstCard, initialCatalogTotalCount, initialCategory]);

    // Handle copying CLI
    const handleCopyCli = async (
        cli: string | undefined,
        title: string,
        id: string,
    ) => {
        if (!cli) return;
        try {
            await navigator.clipboard.writeText(cli);
            setCopiedCliId(id);
            toast({
                title: 'Copied CLI command!',
                description: `${cli} copied to clipboard.`,
            });
            setTimeout(() => setCopiedCliId(null), 2000);
            if (id) {
                await createSystem(title, 'Application', id);
            }
        } catch (err) {
            console.error('Failed to copy CLI', err);
        }
    };

    // Load specific card by index with instant cache check
    const loadCardAtIndex = React.useCallback(
        async (targetIndex: number, category: string, slideDir: number) => {
            const cacheKey = `${category}_${targetIndex}`;
            setDirection(slideDir);
            setCurrentIndex(targetIndex);

            if (cacheRef.current.has(cacheKey)) {
                setCurrentCard(cacheRef.current.get(cacheKey)!);
                if (totalCountCacheRef.current.has(category)) {
                    setTotalCount(totalCountCacheRef.current.get(category)!);
                }
                return;
            }

            setLoadingCard(true);
            try {
                const res = await getCatalogItemByIndex({
                    index: targetIndex,
                    category: category || undefined,
                    tag: selectedTag,
                    searchQuery,
                });

                if (res.item) {
                    cacheRef.current.set(cacheKey, res.item);
                }
                setCurrentCard(res.item || null);
                setTotalCount(res.totalCount);
                totalCountCacheRef.current.set(category, res.totalCount);
            } catch (error) {
                console.error('Error fetching catalog card:', error);
                setCurrentCard(null);
                setTotalCount(0);
            } finally {
                setLoadingCard(false);
            }
        },
        [selectedTag, searchQuery],
    );

    // Idle Background Prefetch for next item (index + 1)
    React.useEffect(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < totalCount) {
            const nextKey = `${activeCategory}_${nextIndex}`;
            if (!cacheRef.current.has(nextKey)) {
                const idleId = (
                    typeof window !== 'undefined' && 'requestIdleCallback' in window
                        ? window.requestIdleCallback
                        : (cb: Function) => setTimeout(cb, 200)
                )(() => {
                    getCatalogItemByIndex({
                        index: nextIndex,
                        category: activeCategory || undefined,
                        tag: selectedTag,
                        searchQuery,
                    })
                        .then((res) => {
                            if (res.item) {
                                cacheRef.current.set(nextKey, res.item);
                            }
                        })
                        .catch(() => {});
                });
                return () => {
                    if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
                        window.cancelIdleCallback(idleId as any);
                    }
                };
            }
        }
    }, [currentIndex, totalCount, activeCategory, selectedTag, searchQuery]);

    // Handle Category Tab Change
    const handleCategoryChange = (category: string) => {
        if (category === activeCategory) return;
        setActiveCategory(category);
        setCurrentIndex(0);
        loadCardAtIndex(0, category, 1);
    };

    // Navigation buttons
    const handleNext = React.useCallback(() => {
        if (currentIndex < totalCount - 1 && !loadingCard) {
            loadCardAtIndex(currentIndex + 1, activeCategory, 1);
        }
    }, [currentIndex, totalCount, loadingCard, loadCardAtIndex, activeCategory]);

    const handlePrev = React.useCallback(() => {
        if (currentIndex > 0 && !loadingCard) {
            loadCardAtIndex(currentIndex - 1, activeCategory, -1);
        }
    }, [currentIndex, loadingCard, loadCardAtIndex, activeCategory]);

    // Keyboard navigation (Left / Right arrow keys)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input/textarea or if modal is open
            if (
                selectedItem ||
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, selectedItem]);

    return (
        <div className='flex-1 space-y-10 p-4 pt-6 md:p-8 max-w-7xl mx-auto'>
            {/* ReactBits Optimized Hero Section */}
            <SpotlightCard
                className='relative w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-neutral-950/80 backdrop-blur-sm p-6 md:p-12 shadow-xl'
                spotlightColor='rgba(147, 51, 234, 0.12)'
                spotlightSize={450}
            >
                {/* Lightweight SVG Grid Pattern */}
                <GridPattern className='opacity-40' width={28} height={28} />

                {/* Subtle Ambient Radial Glow */}
                <div className='absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none' />

                <div className='relative z-10 flex flex-col items-start gap-4 max-w-3xl'>
                    <div className='inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-100/80 dark:bg-white/5 px-3 py-1 text-xs font-medium text-neutral-800 dark:text-neutral-200'>
                        <span className='flex h-2 w-2 rounded-full bg-primary animate-pulse' />
                        <ShinyText speed={3} className='text-xs font-semibold'>
                            Forge Architecture Hub
                        </ShinyText>
                    </div>

                    <h1 className='text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white'>
                        Build faster with <span className='bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-indigo-400'>Forge</span>
                    </h1>

                    <p className='text-base md:text-lg text-muted-foreground font-normal leading-relaxed max-w-2xl'>
                        Explore verified, production-grade backend templates, microservices, and AI integrations. Instant CLI scaffolding for your Next.js backends.
                    </p>

                    {/* Stats Pill */}
                    <div className='flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground'>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10'>
                            <Boxes className='h-3.5 w-3.5 text-primary' />
                            <span>{totalCount > 0 ? `${totalCount}+` : '15+'} Architectures</span>
                        </div>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10'>
                            <Cpu className='h-3.5 w-3.5 text-indigo-400' />
                            <span>CLI Scaffolding Ready</span>
                        </div>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10'>
                            <Flame className='h-3.5 w-3.5 text-amber-500' />
                            <span>Zero GPU Overhead</span>
                        </div>
                    </div>
                </div>
            </SpotlightCard>

            {/* Master Template Spotlight Hero */}
            {masterTemplate && !searchQuery && (
                <section className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <div className='h-5 w-1 rounded-full bg-primary' />
                            <h2 className='text-lg font-bold tracking-tight flex items-center gap-2'>
                                Master Spotlight
                                <Badge
                                    variant='secondary'
                                    className='bg-primary/10 text-primary border-primary/20 text-[10px] px-2'
                                >
                                    Featured
                                </Badge>
                            </h2>
                        </div>
                    </div>

                    <SpotlightCard
                        className='relative w-full overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 shadow-lg group hover:border-primary/40'
                        spotlightColor='rgba(147, 51, 234, 0.15)'
                        spotlightSize={400}
                    >
                        <div className='relative z-10 flex flex-col lg:flex-row gap-6 p-6 md:p-8 items-center'>
                            {/* Preview Area */}
                            <div
                                className='w-full lg:w-3/5 aspect-video md:aspect-[16/9] relative rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 shadow-sm group-hover:shadow-primary/10 transition-all duration-300 cursor-pointer bg-neutral-950'
                                onClick={() => setSelectedItem(masterTemplate)}
                            >
                                <img
                                    src={
                                        masterTemplate.thumbnailUrl ||
                                        masterTemplate.demoGifUrl ||
                                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'
                                    }
                                    alt={masterTemplate.name}
                                    className='h-full w-full object-cover group-hover:scale-102 transition-transform duration-300'
                                    loading='lazy'
                                />
                                <div className='absolute top-3 right-3 z-10'>
                                    <Badge
                                        variant='secondary'
                                        className='bg-black/80 hover:bg-black text-white border-white/10 text-[10px] px-2.5 h-5 backdrop-blur-md'
                                    >
                                        Master
                                    </Badge>
                                </div>
                                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4'>
                                    <span className='text-xs text-white flex items-center gap-1.5 font-medium'>
                                        <Maximize2 className='h-3.5 w-3.5' /> Click to inspect template
                                    </span>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className='w-full lg:w-2/5 flex flex-col gap-4 items-start justify-center'>
                                <div className='flex items-center gap-2'>
                                    <Avatar className='h-6 w-6 border border-neutral-200 dark:border-white/10'>
                                        <AvatarImage
                                            src={masterTemplate.author?.profileUrl}
                                        />
                                        <AvatarFallback className='text-[10px]'>
                                            {masterTemplate.author?.name?.substring(0, 1) || 'P'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className='text-xs text-muted-foreground font-medium'>
                                        {masterTemplate.author?.name || 'PostPipe'}
                                    </span>
                                </div>

                                <div>
                                    <h3 className='text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-primary transition-colors'>
                                        {masterTemplate.name}
                                    </h3>
                                    <p className='text-sm text-muted-foreground mt-1.5 line-clamp-2'>
                                        A high-performance, production-ready foundation to accelerate your backend workflow.
                                    </p>
                                </div>

                                <div className='flex flex-wrap gap-1.5'>
                                    {masterTemplate.tags?.slice(0, 4).map((tag) => (
                                        <span
                                            key={tag}
                                            className='px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-300'
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className='flex flex-wrap items-center gap-2 pt-2 w-full'>
                                    {masterTemplate.cli && (
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            className='h-9 rounded-lg gap-2 text-xs font-medium border-neutral-200 dark:border-white/10 hover:border-primary/40'
                                            onClick={() =>
                                                handleCopyCli(
                                                    masterTemplate.cli,
                                                    masterTemplate.name,
                                                    masterTemplate._id,
                                                )
                                            }
                                        >
                                            {copiedCliId === masterTemplate._id ? (
                                                <Check className='h-3.5 w-3.5 text-green-500' />
                                            ) : (
                                                <Terminal className='h-3.5 w-3.5' />
                                            )}
                                            <span>
                                                {copiedCliId === masterTemplate._id
                                                    ? 'Copied CLI'
                                                    : 'Copy CLI'}
                                            </span>
                                        </Button>
                                    )}
                                    <Button
                                        size='sm'
                                        className='h-9 rounded-lg gap-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90'
                                        onClick={() => setSelectedItem(masterTemplate)}
                                    >
                                        <Sparkles className='h-3.5 w-3.5' />
                                        <span>View Details</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                </section>
            )}

            {/* Catalog Single-Card Showcase */}
            <section className='space-y-6'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-white/10 pb-4'>
                    <div className='flex items-center gap-2'>
                        <div className='h-5 w-1 rounded-full bg-primary/60' />
                        <h2 className='text-lg font-bold tracking-tight'>
                            Explore Catalog
                        </h2>
                    </div>

                    {/* Category Filter Chips */}
                    <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full'>
                        {categoryTabs.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => handleCategoryChange(tab.value)}
                                className={cn(
                                    'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border cursor-pointer',
                                    activeCategory === tab.value
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                                        : 'bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:border-primary/30',
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation Header & Progress Counter */}
                {totalCount > 0 && (
                    <div className='flex items-center justify-between px-1'>
                        <div className='text-xs text-muted-foreground hidden sm:flex items-center gap-1.5'>
                            <span>Use keys</span>
                            <kbd className='px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10 font-mono text-[10px]'>←</kbd>
                            <kbd className='px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10 font-mono text-[10px]'>→</kbd>
                            <span>to navigate</span>
                        </div>
                        <div className='flex items-center gap-2 ml-auto'>
                            <Button
                                variant='outline'
                                size='icon'
                                disabled={currentIndex === 0 || loadingCard}
                                onClick={handlePrev}
                                className='h-8 w-8 rounded-full border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 disabled:opacity-30 hover:border-primary/30 cursor-pointer'
                                title='Previous template (Left Arrow)'
                            >
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <div className='px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-xs font-mono font-medium'>
                                {String(currentIndex + 1).padStart(2, '0')} /{' '}
                                {String(Math.max(1, totalCount)).padStart(2, '0')}
                            </div>
                            <Button
                                variant='outline'
                                size='icon'
                                disabled={currentIndex >= totalCount - 1 || loadingCard}
                                onClick={handleNext}
                                className='h-8 w-8 rounded-full border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 disabled:opacity-30 hover:border-primary/30 cursor-pointer'
                                title='Next template (Right Arrow)'
                            >
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Single Showcase Card with Hardware-Accelerated Motion */}
                <div className='relative min-h-[380px] w-full'>
                    {loadingCard ? (
                        <div className='w-full rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 md:p-8 flex flex-col lg:flex-row gap-6 shadow-sm items-center'>
                            <Skeleton className='w-full lg:w-3/5 aspect-video md:aspect-[16/9] rounded-xl' />
                            <div className='w-full lg:w-2/5 space-y-4 flex flex-col justify-center'>
                                <div className='flex items-center gap-2'>
                                    <Skeleton className='h-6 w-6 rounded-full' />
                                    <Skeleton className='h-4 w-20' />
                                    <Skeleton className='h-3 w-3 rounded-full' />
                                    <Skeleton className='h-4 w-16' />
                                </div>
                                <Skeleton className='h-7 w-3/4' />
                                <Skeleton className='h-4 w-full' />
                                <Skeleton className='h-4 w-4/5' />
                                <div className='flex flex-wrap gap-1.5'>
                                    <Skeleton className='h-5 w-16 rounded-full' />
                                    <Skeleton className='h-5 w-20 rounded-full' />
                                    <Skeleton className='h-5 w-14 rounded-full' />
                                </div>
                                <div className='flex gap-2 pt-2'>
                                    <Skeleton className='h-9 w-28 rounded-lg' />
                                    <Skeleton className='h-9 w-28 rounded-lg' />
                                </div>
                            </div>
                        </div>
                    ) : currentCard ? (
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={`${activeCategory}_${currentIndex}_${currentCard._id}`}
                                initial={{ opacity: 0, x: direction * 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -direction * 20 }}
                                transition={{
                                    duration: 0.18,
                                    ease: 'easeOut',
                                }}
                            >
                                <SpotlightCard
                                    className='w-full rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 shadow-md overflow-hidden hover:border-primary/40'
                                    spotlightColor='rgba(147, 51, 234, 0.12)'
                                    spotlightSize={380}
                                >
                                    <div className='flex flex-col lg:flex-row gap-6 p-6 md:p-8 items-center'>
                                        {/* Preview Media */}
                                        <div
                                            className='w-full lg:w-3/5 aspect-video md:aspect-[16/9] relative rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 shadow-sm cursor-pointer group bg-neutral-950'
                                            onClick={() => setSelectedItem(currentCard)}
                                        >
                                            <img
                                                src={
                                                    currentCard.thumbnailUrl ||
                                                    currentCard.demoGifUrl ||
                                                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'
                                                }
                                                alt={currentCard.name}
                                                className='h-full w-full object-cover group-hover:scale-102 transition-transform duration-300'
                                                loading='lazy'
                                            />
                                            <div className='absolute top-3 right-3 z-10'>
                                                <Badge
                                                    variant='secondary'
                                                    className='bg-black/80 hover:bg-black text-white border-white/10 text-[10px] px-2.5 h-5 backdrop-blur-md'
                                                >
                                                    Free
                                                </Badge>
                                            </div>
                                            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4'>
                                                <span className='text-xs text-white flex items-center gap-1.5 font-medium'>
                                                    <Maximize2 className='h-3.5 w-3.5' /> Click to inspect
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Content & Action Bar */}
                                        <div className='w-full lg:w-2/5 flex flex-col gap-4 items-start justify-center'>
                                            <div className='flex items-center gap-2'>
                                                <Avatar className='h-6 w-6 border border-neutral-200 dark:border-white/10'>
                                                    <AvatarImage
                                                        src={currentCard.author?.profileUrl}
                                                    />
                                                    <AvatarFallback className='text-[10px]'>
                                                        {currentCard.author?.name?.substring(0, 1) || 'P'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className='text-xs text-muted-foreground font-medium'>
                                                    {currentCard.author?.name || 'PostPipe'}
                                                </span>
                                                <span className='text-neutral-400 text-xs'>•</span>
                                                <span className='text-xs text-primary font-medium'>
                                                    {currentCard.category || 'Backend'}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white'>
                                                    {currentCard.name}
                                                </h3>
                                                <p className='text-sm text-muted-foreground mt-1.5 line-clamp-2'>
                                                    Production-ready architecture ready to clone and deploy.
                                                </p>
                                            </div>

                                            <div className='flex flex-wrap gap-1.5'>
                                                {currentCard.tags?.slice(0, 4).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className='px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-300'
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className='flex flex-wrap items-center gap-2 pt-2 w-full'>
                                                {currentCard.cli && (
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        className='h-9 rounded-lg gap-2 text-xs font-medium border-neutral-200 dark:border-white/10 hover:border-primary/40'
                                                        onClick={() =>
                                                            handleCopyCli(
                                                                currentCard.cli,
                                                                currentCard.name,
                                                                currentCard._id,
                                                            )
                                                        }
                                                    >
                                                        {copiedCliId === currentCard._id ? (
                                                            <Check className='h-3.5 w-3.5 text-green-500' />
                                                        ) : (
                                                            <Terminal className='h-3.5 w-3.5' />
                                                        )}
                                                        <span>
                                                            {copiedCliId === currentCard._id
                                                                ? 'Copied CLI'
                                                                : 'Copy CLI'}
                                                        </span>
                                                    </Button>
                                                )}
                                                <Button
                                                    size='sm'
                                                    className='h-9 rounded-lg gap-2 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100'
                                                    onClick={() => setSelectedItem(currentCard)}
                                                >
                                                    <Sparkles className='h-3.5 w-3.5' />
                                                    <span>Inspect Details</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className='text-center py-16 text-muted-foreground border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl'>
                            <p>No templates found for {activeCategory || 'this filter'}.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Inspect Modal */}
            <ExploreModal
                open={!!selectedItem}
                onOpenChange={(open: boolean) => !open && setSelectedItem(null)}
                item={
                    selectedItem
                        ? {
                              id: selectedItem._id,
                              title: selectedItem.name,
                              category: selectedItem.category,
                              image:
                                  selectedItem.demoGifUrl &&
                                  selectedItem.demoGifUrl.startsWith('http')
                                      ? selectedItem.demoGifUrl
                                      : selectedItem.thumbnailUrl ||
                                        selectedItem.demoGifUrl ||
                                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
                              author: {
                                  name: selectedItem.author?.name || 'PostPipe',
                                  avatar: selectedItem.author?.profileUrl || '',
                              },
                              tags: selectedItem.tags || [],
                              cli: selectedItem.cli,
                              aiPrompt: selectedItem.aiPrompt,
                              npmPackageUrl: selectedItem.npmPackageUrl,
                              databaseConfigurations:
                                  selectedItem.databaseConfigurations,
                          }
                        : null
                }
            />
        </div>
    );
}
