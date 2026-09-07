import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function SystemsSkeleton() {
    return (
        <div className='flex flex-col gap-8 w-full max-w-7xl mx-auto'>
            {/* Hero Section Skeleton */}
            <div className='relative w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-neutral-950/80 backdrop-blur-sm p-6 md:p-12 shadow-xl'>
                <div className='relative z-10 flex flex-col items-start gap-4 max-w-3xl'>
                    {/* Badge Pill */}
                    <div className='inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-100/80 dark:bg-white/5 px-3 py-1'>
                        <span className='flex h-2 w-2 rounded-full bg-primary/50' />
                        <Skeleton className='h-4 w-36' />
                    </div>

                    {/* Headline */}
                    <Skeleton className='h-10 md:h-14 lg:h-16 w-full max-w-md' />

                    {/* Subtitle */}
                    <div className='space-y-2 w-full max-w-2xl'>
                        <Skeleton className='h-5 w-full' />
                        <Skeleton className='h-5 w-3/4' />
                    </div>

                    {/* Stats Pill Row */}
                    <div className='flex flex-wrap items-center gap-3 pt-2'>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 h-7'>
                            <Skeleton className='h-3.5 w-3.5 rounded' />
                            <Skeleton className='h-3.5 w-24' />
                        </div>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 h-7'>
                            <Skeleton className='h-3.5 w-3.5 rounded' />
                            <Skeleton className='h-3.5 w-28' />
                        </div>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 h-7'>
                            <Skeleton className='h-3.5 w-3.5 rounded' />
                            <Skeleton className='h-3.5 w-32' />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Action Bar Skeleton */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
                <Skeleton className='h-9 w-full sm:max-w-xs md:max-w-sm rounded-xl' />
                <Skeleton className='h-9 w-full sm:w-44 rounded-xl shrink-0' />
            </div>

            {/* Card Grid Skeleton */}
            <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card
                        key={index}
                        className='overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/80 shadow-md flex flex-col justify-between'
                    >
                        {/* Thumbnail Media Skeleton */}
                        <div className='aspect-[16/9] w-full relative bg-neutral-950/20'>
                            <Skeleton className='h-full w-full' />
                        </div>

                        {/* Card Content Skeleton */}
                        <CardContent className='p-5 space-y-4 flex-1 flex flex-col justify-between'>
                            <div className='space-y-3'>
                                {/* Author & Status Header */}
                                <div className='flex items-center justify-between gap-2'>
                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-6 w-6 rounded-full' />
                                        <Skeleton className='h-3.5 w-20' />
                                    </div>
                                    <Skeleton className='h-5 w-16 rounded-full' />
                                </div>

                                {/* Title */}
                                <Skeleton className='h-6 w-3/4' />

                                {/* Tags */}
                                <div className='flex flex-wrap gap-1.5 pt-1'>
                                    <Skeleton className='h-5 w-16 rounded-full' />
                                    <Skeleton className='h-5 w-20 rounded-full' />
                                    <Skeleton className='h-5 w-14 rounded-full' />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-white/5'>
                                <Skeleton className='h-8 flex-1 rounded-lg' />
                                <Skeleton className='h-8 flex-1 rounded-lg' />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
