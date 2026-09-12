'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, CornerDownLeft, X, Sparkles, Tag, Layers, ExternalLink } from 'lucide-react';
import { getTemplates, getExploreFilters } from '@/lib/actions/explore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExploreModal } from './ExploreModal';

interface SearchPopupProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function SearchPopup({ open, setOpen }: SearchPopupProps) {
    const router = useRouter();
    const [query, setQuery] = React.useState('');
    const [templates, setTemplates] = React.useState<any[]>([]);
    const [categories, setCategories] = React.useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
    const [loading, setLoading] = React.useState(true);
    const [selectedTemplate, setSelectedTemplate] = React.useState<any | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [t, f] = await Promise.all([
                    getTemplates(),
                    getExploreFilters(),
                ]);
                setTemplates(t || []);
                setCategories(f?.categories || []);
            } catch (e) {
                console.error('Failed to fetch search data', e);
            } finally {
                setLoading(false);
            }
        };
        if (open) {
            fetchData();
        }
    }, [open]);

    // Lock background scroll when search modal is open
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            if (typeof window !== 'undefined') {
                if (typeof (window as any).__lenis?.stop === 'function') {
                    (window as any).__lenis.stop();
                }
            }
        } else {
            document.body.style.overflow = '';
            if (typeof window !== 'undefined') {
                if (typeof (window as any).__lenis?.start === 'function') {
                    (window as any).__lenis.start();
                }
            }
        }

        return () => {
            document.body.style.overflow = '';
            if (typeof window !== 'undefined') {
                if (typeof (window as any).__lenis?.start === 'function') {
                    (window as any).__lenis.start();
                }
            }
        };
    }, [open]);

    const handleSearch = () => {
        if (!query.trim()) return;
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('q', query);
        router.push(`/explore?${searchParams.toString()}`);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const filteredTemplates = templates.filter((t) => {
        // Category filter
        if (selectedCategory !== 'All') {
            const matchesCat = t.category?.toLowerCase() === selectedCategory.toLowerCase();
            const matchesTag = t.tags?.some((tag: string) => tag.toLowerCase() === selectedCategory.toLowerCase());
            if (!matchesCat && !matchesTag) return false;
        }

        // Query filter
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        const matchName = t.name?.toLowerCase().includes(q);
        const matchCategory = t.category?.toLowerCase().includes(q);
        const matchTag = t.tags?.some((tag: string) =>
            tag.toLowerCase().includes(q),
        );
        return matchName || matchCategory || matchTag;
    });

    const categoryTabs = ['All', ...categories.slice(0, 7)];

    const handleClose = () => {
        setOpen(false);
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('q')) {
            searchParams.delete('q');
            router.push(`/explore?${searchParams.toString()}`);
        }
        setQuery('');
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(isOpen) => {
                if (!isOpen) handleClose();
                else setOpen(true);
            }}>
                <DialogContent className='overflow-hidden p-0 shadow-2xl bg-neutral-950 border-neutral-800 rounded-none sm:rounded-2xl max-w-4xl w-full h-[100dvh] sm:h-[85vh] max-h-[100dvh] sm:max-h-[85vh] flex flex-col [&>button]:hidden'>
                    <DialogTitle className='sr-only'>Search Templates</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Search for backend templates, systems, and categories.
                    </DialogDescription>

                    <div className='bg-transparent text-white h-full w-full flex flex-col min-h-0 relative pb-safe'>
                        {/* Top Header Bar with Close Icon */}
                        <div className='order-1 flex items-center justify-between px-4 py-2.5 border-b border-neutral-800/80 bg-neutral-900/60 shrink-0'>
                            <div className='flex items-center gap-2'>
                                <span className='text-xs font-semibold text-neutral-300 tracking-wide'>Search Templates</span>
                            </div>
                            <button
                                type='button'
                                onClick={handleClose}
                                className='p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors'
                                title='Close modal'
                            >
                                <X className='h-4 w-4' />
                            </button>
                        </div>

                        {/* Search Input Bar */}
                        <div className='order-4 sm:order-2 flex items-center border-t sm:border-t-0 sm:border-b border-neutral-800/80 px-4 bg-neutral-900/90 sm:bg-neutral-900/30 shrink-0 z-10 sticky bottom-0'>
                            <Search className='mr-3 h-5 w-5 shrink-0 text-neutral-400' />
                            <input
                                autoFocus
                                placeholder='Search templates (e.g. Auth)...'
                                className='flex h-14 w-full bg-transparent py-3 outline-none placeholder:text-neutral-500 text-base font-normal text-white'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            {query && (
                                <button
                                    type='button'
                                    onClick={() => setQuery('')}
                                    className='p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors'
                                    title='Clear search'
                                >
                                    <X className='h-4 w-4' />
                                </button>
                            )}
                        </div>

                        {/* Quick Category / Tag Filter Chips */}
                        <div className='order-3 flex items-center gap-1.5 px-4 py-2.5 border-t sm:border-t-0 sm:border-b border-neutral-800/60 overflow-x-auto no-scrollbar bg-neutral-900/60 sm:bg-neutral-900/20 shrink-0 z-10'>
                            {categoryTabs.map((cat) => {
                                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                                return (
                                    <button
                                        key={cat}
                                        type='button'
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            'px-3.5 py-1.5 sm:py-1 rounded-full text-xs font-medium transition-all shrink-0 border',
                                            isSelected
                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
                                        )}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Scrollable Results Grid */}
                        <div
                            className='order-2 sm:order-4 flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 pr-3.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-800 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors flex flex-col-reverse sm:block'
                            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.18) transparent' }}
                            data-lenis-prevent='true'
                        >
                            {loading ? (
                                <div className='flex flex-col items-center justify-center py-16 text-neutral-500 gap-2 h-full'>
                                    <div className='h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                                    <span className='text-xs'>Loading templates...</span>
                                </div>
                            ) : filteredTemplates.length === 0 ? (
                                <div className='text-center py-16 text-neutral-500 flex flex-col items-center justify-center gap-2 h-full'>
                                    <Search className='h-8 w-8 text-neutral-700' />
                                    <p className='text-sm'>No templates found for &quot;{query || selectedCategory}&quot;.</p>
                                    <p className='text-xs text-neutral-600'>Try searching with a different keyword or category.</p>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-2'>
                                    {filteredTemplates.map((t) => (
                                        <div
                                            key={t._id}
                                            onClick={() => setSelectedTemplate(t)}
                                            className='cursor-pointer flex flex-col items-start gap-2.5 p-3 bg-neutral-900/40 border border-neutral-800/80 hover:border-primary/50 hover:bg-neutral-900/80 rounded-xl transition-all duration-200 group active:scale-[0.98]'
                                        >
                                            {/* Media Thumbnail */}
                                            <div className='w-full aspect-[16/10] bg-neutral-950 rounded-lg border border-neutral-800 group-hover:border-neutral-700 transition-colors overflow-hidden relative'>
                                                {t.thumbnailUrl || t.demoGifUrl ? (
                                                    <img
                                                        src={t.thumbnailUrl || t.demoGifUrl}
                                                        className='w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300'
                                                        alt={t.name}
                                                    />
                                                ) : (
                                                    <div className='w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-700 font-mono text-xs'>
                                                        Preview
                                                    </div>
                                                )}
                                                {t.category && (
                                                    <div className='absolute top-2 right-2'>
                                                        <Badge
                                                            variant='secondary'
                                                            className='bg-black/70 backdrop-blur-sm border-white/10 text-white text-[10px] px-2 py-0.5 rounded-full'
                                                        >
                                                            {t.category}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info Section */}
                                            <div className='space-y-1 w-full px-0.5'>
                                                <div className='flex items-center justify-between gap-2'>
                                                    <p className='font-semibold text-xs sm:text-sm text-neutral-200 group-hover:text-white transition-colors truncate'>
                                                        {t.name}
                                                    </p>
                                                </div>

                                                {t.tags && t.tags.length > 0 && (
                                                    <p className='text-[11px] text-neutral-400 truncate'>
                                                        {t.tags.slice(0, 3).map((tag: string) => `#${tag}`).join('  ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer hint pinned at bottom */}
                        <div className='order-5 hidden sm:flex shrink-0 items-center justify-center px-4 py-3 border-t border-neutral-800/80 bg-neutral-900/30 text-[11px] sm:text-xs text-neutral-500'>
                            <span>Click any card to inspect details, copy CLI, or configure DB</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* In-Place Template Detail Modal */}
            <ExploreModal
                open={!!selectedTemplate}
                onOpenChange={(modalOpen) => !modalOpen && setSelectedTemplate(null)}
                item={
                    selectedTemplate
                        ? {
                              id: selectedTemplate._id,
                              title: selectedTemplate.name,
                              category: selectedTemplate.category,
                              image:
                                  selectedTemplate.demoGifUrl &&
                                  selectedTemplate.demoGifUrl.startsWith('http')
                                      ? selectedTemplate.demoGifUrl
                                      : selectedTemplate.thumbnailUrl ||
                                        selectedTemplate.demoGifUrl ||
                                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
                              author: {
                                  name: selectedTemplate.author?.name || 'PostPipe',
                                  avatar: selectedTemplate.author?.profileUrl || '',
                              },
                              tags: selectedTemplate.tags || [],
                              cli: selectedTemplate.cli,
                              aiPrompt: selectedTemplate.aiPrompt,
                              npmPackageUrl: selectedTemplate.npmPackageUrl,
                              databaseConfigurations:
                                  selectedTemplate.databaseConfigurations,
                          }
                        : null
                }
            />
        </>
    );
}
