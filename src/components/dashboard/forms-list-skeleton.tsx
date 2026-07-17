import { Skeleton } from "@/components/ui/skeleton";

export function FormsListSkeleton() {
    return (
        <div className="relative min-h-screen text-foreground animate-pulse">
            <div className="relative z-10 flex flex-col gap-10 pb-16">

                {/* Hero header skeleton */}
                <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-white/5 bg-neutral-100/80 dark:bg-white/[0.02] p-8">
                    <div className="flex flex-col gap-6">
                        {/* Top row: pill + button */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <Skeleton className="h-7 w-52 rounded-full bg-muted/60 dark:bg-white/[0.06]" />
                            <Skeleton className="h-10 w-36 rounded-lg bg-muted/60 dark:bg-white/[0.06]" />
                        </div>
                        {/* Title */}
                        <div className="space-y-3">
                            <Skeleton className="h-14 w-72 max-w-full bg-muted/60 dark:bg-white/[0.06]" />
                            <Skeleton className="h-4 w-96 max-w-full bg-muted/40 dark:bg-white/[0.04]" />
                        </div>
                        {/* Stat pills */}
                        <div className="flex flex-wrap gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-11 w-32 rounded-lg bg-muted/50 dark:bg-white/[0.05]" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-4 flex-wrap">
                    <Skeleton className="h-10 w-52 rounded-lg bg-muted/60 dark:bg-white/[0.06]" />
                </div>

                {/* Search + Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Skeleton className="h-10 flex-1 rounded-xl bg-muted/50 dark:bg-white/[0.05]" />
                    <Skeleton className="h-10 w-[120px] rounded-xl bg-muted/50 dark:bg-white/[0.05]" />
                    <Skeleton className="h-10 w-[140px] rounded-xl bg-muted/50 dark:bg-white/[0.05]" />
                </div>

                {/* Endpoint rows */}
                <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-500/[0.10] bg-indigo-50/50 dark:bg-indigo-950/[0.10] overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-neutral-200/70 dark:border-white/[0.05] last:border-b-0">
                            {/* Status dot */}
                            <Skeleton className="h-2 w-2 rounded-full shrink-0 bg-muted/70 dark:bg-white/[0.1]" />
                            {/* Name + badge */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Skeleton className="h-4 w-40 bg-muted/60 dark:bg-white/[0.07]" />
                                <Skeleton className="h-4 w-14 rounded-full bg-muted/50 dark:bg-white/[0.06] hidden sm:block" />
                            </div>
                            {/* Stats */}
                            <div className="hidden md:flex items-center gap-5 shrink-0">
                                <Skeleton className="h-3 w-24 bg-muted/40 dark:bg-white/[0.05]" />
                                <Skeleton className="h-3 w-20 bg-muted/40 dark:bg-white/[0.05]" />
                                <Skeleton className="h-3 w-12 bg-muted/30 dark:bg-white/[0.04]" />
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                <Skeleton className="h-7 w-7 rounded-md bg-muted/50 dark:bg-white/[0.06]" />
                                <Skeleton className="h-3.5 w-3.5 rounded-sm bg-muted/40 dark:bg-white/[0.05]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
