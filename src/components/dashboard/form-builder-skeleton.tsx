
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function FormBuilderSkeleton() {
    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 p-4 animate-pulse">

            {/* Page header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" disabled className="shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="space-y-2 flex-1 min-w-0">
                    <Skeleton className="h-8 w-52 bg-muted/60 dark:bg-white/[0.07]" />
                    <Skeleton className="h-4 w-72 max-w-full bg-muted/40 dark:bg-white/[0.05]" />
                </div>
                <div className="ml-auto flex gap-2 shrink-0">
                    <Skeleton className="h-9 w-20 rounded-lg bg-muted/50 dark:bg-white/[0.06]" />
                    <Skeleton className="h-9 w-32 rounded-lg bg-muted/60 dark:bg-white/[0.07]" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Builder */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Form settings card */}
                    <Card className="border-border/50 bg-card/60 dark:bg-white/[0.02]">
                        <CardHeader>
                            <Skeleton className="h-5 w-36 bg-muted/60 dark:bg-white/[0.07]" />
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-3.5 w-24 bg-muted/50 dark:bg-white/[0.06]" />
                                    <Skeleton className="h-10 w-full rounded-lg bg-muted/40 dark:bg-white/[0.05]" />
                                    {i === 2 && <Skeleton className="h-3 w-64 bg-muted/30 dark:bg-white/[0.04]" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Fields section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-20 bg-muted/60 dark:bg-white/[0.07]" />
                            <Skeleton className="h-8 w-28 rounded-lg bg-muted/50 dark:bg-white/[0.06]" />
                        </div>

                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="border-border/50 bg-card/60 dark:bg-white/[0.02]">
                                    <CardContent className="p-4 flex gap-4 items-start">
                                        {/* Drag handle */}
                                        <Skeleton className="h-4 w-4 mt-3 shrink-0 bg-muted/40 dark:bg-white/[0.05]" />
                                        <div className="grid gap-4 flex-1 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Skeleton className="h-3.5 w-16 bg-muted/50 dark:bg-white/[0.06]" />
                                                <Skeleton className="h-10 w-full rounded-lg bg-muted/40 dark:bg-white/[0.05]" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-3.5 w-12 bg-muted/50 dark:bg-white/[0.06]" />
                                                <Skeleton className="h-10 w-full rounded-lg bg-muted/40 dark:bg-white/[0.05]" />
                                            </div>
                                        </div>
                                        {/* Delete button */}
                                        <Skeleton className="h-7 w-7 rounded-md shrink-0 mt-1 bg-muted/40 dark:bg-white/[0.05]" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Code Preview */}
                <div className="space-y-6">
                    <Card className="sticky top-6 border-border/50 bg-card/60 dark:bg-white/[0.02]">
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-5 w-40 bg-muted/60 dark:bg-white/[0.07]" />
                            <Skeleton className="h-4 w-full bg-muted/40 dark:bg-white/[0.05]" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Code block preview */}
                            <div className="rounded-xl border border-border/50 bg-neutral-950/50 dark:bg-black/30 p-4 space-y-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-3 bg-white/[0.05]"
                                        style={{ width: `${60 + Math.sin(i) * 30}%` }}
                                    />
                                ))}
                            </div>
                            <Skeleton className="h-9 w-full rounded-lg bg-muted/40 dark:bg-white/[0.05]" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
