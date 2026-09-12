import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function ExploreSkeleton() {
    return (
        <div className='flex-1 space-y-10 p-4 pt-6 md:p-8 max-w-7xl mx-auto'>
            {/* Hero Section Skeleton */}
            <div className='relative w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-neutral-950/80 backdrop-blur-sm p-6 md:p-12 shadow-xl'>
                <div className='relative z-10 flex flex-col items-start gap-4 max-w-3xl'>
                    {/* Badge Pill */}
                    <div className='inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-100/80 dark:bg-white/5 px-3 py-1'>
                        <span className='flex h-2 w-2 rounded-full bg-primary/50' />
                        <Skeleton className='h-4 w-36' />
                    </div>

                    {/* Headline */}
                    <Skeleton className='h-10 md:h-14 lg:h-16 w-full max-w-xl' />

                    {/* Subtitle */}
                    <div className='space-y-2 w-full max-w-2xl'>
                        <Skeleton className='h-5 w-full' />
                        <Skeleton className='h-5 w-4/5' />
                    </div>

                    {/* Stats Pill Row */}
                    <div className='flex flex-wrap items-center gap-3 pt-2'>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 h-7'>
                            <Skeleton className='h-3.5 w-3.5 rounded' />
                            <Skeleton className='h-3.5 w-24' />
                        </div>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 h-7'>
                            <Skeleton className='h-3.5 w-3.5 rounded' />
                            <Skeleton className='h-3.5 w-32' />
                        </div>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 h-7'>
                            <Skeleton className='h-3.5 w-3.5 rounded' />
                            <Skeleton className='h-3.5 w-28' />
                        </div>
                    </div>
                </div>
            </div>

            {/* Master Template Spotlight Hero Skeleton */}
            <section className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='h-5 w-1 rounded-full bg-primary' />
                        <div className='flex items-center gap-2'>
                            <Skeleton className='h-5 w-32' />
                            <Skeleton className='h-5 w-16 rounded-full' />
                        </div>
                    </div>
                </div>

                <div className='relative w-full overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 shadow-lg p-6 md:p-8'>
                    <div className='relative z-10 flex flex-col lg:flex-row gap-6 items-center'>
                        {/* Preview Media Skeleton */}
                        <div className='w-full lg:w-3/5 aspect-video md:aspect-[16/9] relative rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 shadow-sm bg-neutral-950/20'>
                            <Skeleton className='h-full w-full rounded-xl' />
                        </div>

                        {/* Info Area Skeleton */}
                        <div className='w-full lg:w-2/5 flex flex-col gap-4 items-start justify-center'>
                            {/* Author */}
                            <div className='flex items-center gap-2'>
                                <Skeleton className='h-6 w-6 rounded-full' />
                                <Skeleton className='h-4 w-20' />
                            </div>

                            {/* Title & Description */}
                            <div className='w-full space-y-1.5'>
                                <Skeleton className='h-8 md:h-9 w-3/4' />
                                <Skeleton className='h-4 w-full mt-1.5' />
                                <Skeleton className='h-4 w-5/6' />
                            </div>

                            {/* Tags */}
                            <div className='flex flex-wrap gap-1.5'>
                                <Skeleton className='h-6 w-16 rounded-full' />
                                <Skeleton className='h-6 w-20 rounded-full' />
                                <Skeleton className='h-6 w-14 rounded-full' />
                                <Skeleton className='h-6 w-16 rounded-full' />
                            </div>

                            {/* Action Buttons */}
                            <div className='flex flex-wrap items-center gap-2 pt-2 w-full'>
                                <Skeleton className='h-9 w-28 rounded-lg' />
                                <Skeleton className='h-9 w-28 rounded-lg' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Showcase Section Skeleton */}
            <section className='space-y-6'>
                {/* Header & Filter Chips */}
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-white/10 pb-4'>
                    <div className='flex items-center gap-2'>
                        <div className='h-5 w-1 rounded-full bg-primary/60' />
                        <Skeleton className='h-6 w-32' />
                    </div>

                    {/* Category Filter Chips Skeleton */}
                    <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full'>
                        <Skeleton className='h-[30px] w-12 rounded-full' />
                        <Skeleton className='h-[30px] w-20 rounded-full' />
                        <Skeleton className='h-[30px] w-24 rounded-full' />
                        <Skeleton className='h-[30px] w-16 rounded-full' />
                        <Skeleton className='h-[30px] w-20 rounded-full' />
                        <Skeleton className='h-[30px] w-24 rounded-full' />
                    </div>
                </div>

                {/* Navigation Header & Progress Counter Skeleton */}
                <div className='flex items-center justify-between px-1'>
                    <div className='hidden sm:flex items-center gap-1.5'>
                        <Skeleton className='h-4 w-40' />
                    </div>
                    <div className='flex items-center gap-2 ml-auto'>
                        <Skeleton className='h-8 w-8 rounded-full' />
                        <Skeleton className='h-7 w-20 rounded-full' />
                        <Skeleton className='h-8 w-8 rounded-full' />
                    </div>
                </div>

                {/* Single Showcase Card Skeleton */}
                <div className='relative min-h-[380px] w-full'>
                    <div className='w-full rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 shadow-md overflow-hidden'>
                        <div className='flex flex-col lg:flex-row gap-6 p-6 md:p-8 items-center'>
                            {/* Preview Media Skeleton */}
                            <div className='w-full lg:w-3/5 aspect-video md:aspect-[16/9] relative rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 shadow-sm bg-neutral-950/20'>
                                <Skeleton className='h-full w-full rounded-xl' />
                            </div>

                            {/* Info Area Skeleton */}
                            <div className='w-full lg:w-2/5 flex flex-col gap-4 items-start justify-center'>
                                {/* Author & Category */}
                                <div className='flex items-center gap-2'>
                                    <Skeleton className='h-6 w-6 rounded-full' />
                                    <Skeleton className='h-4 w-20' />
                                    <span className='text-neutral-400 text-xs'>•</span>
                                    <Skeleton className='h-4 w-16' />
                                </div>

                                {/* Title & Description */}
                                <div className='w-full space-y-1.5'>
                                    <Skeleton className='h-8 w-3/4' />
                                    <Skeleton className='h-4 w-full mt-1.5' />
                                    <Skeleton className='h-4 w-4/5' />
                                </div>

                                {/* Tags */}
                                <div className='flex flex-wrap gap-1.5'>
                                    <Skeleton className='h-6 w-16 rounded-full' />
                                    <Skeleton className='h-6 w-20 rounded-full' />
                                    <Skeleton className='h-6 w-14 rounded-full' />
                                    <Skeleton className='h-6 w-16 rounded-full' />
                                </div>

                                {/* Action Buttons */}
                                <div className='flex flex-wrap items-center gap-2 pt-2 w-full'>
                                    <Skeleton className='h-9 w-28 rounded-lg' />
                                    <Skeleton className='h-9 w-32 rounded-lg' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export function ExploreGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid-rows-2 content-start min-h-[560px]'>
            {Array.from({ length: count }).map((_, i) => (
                <Card
                    key={i}
                    className='explore-card overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm'
                >
                    <div className='aspect-video relative bg-muted/40'>
                        <Skeleton className='h-full w-full rounded-none' />
                    </div>
                    <CardContent className='p-4 pb-3'>
                        <Skeleton className='h-5 w-3/4 mb-1' />
                    </CardContent>
                    <CardFooter className='p-4 pt-0 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Skeleton className='h-5 w-5 rounded-full' />
                            <Skeleton className='h-3 w-20' />
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
