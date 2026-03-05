
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function SubmissionsSkeleton() {
    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">

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
                    <Skeleton className="h-9 w-28 rounded-lg bg-muted/50 dark:bg-white/[0.06]" />
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="border-border/50 bg-card/60 dark:bg-white/[0.02]">
                        <CardHeader className="pb-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full bg-muted/60 dark:bg-white/[0.07]" />
                                <Skeleton className="h-4 w-28 bg-muted/60 dark:bg-white/[0.07]" />
                            </div>
                            <Skeleton className="h-3.5 w-52 bg-muted/40 dark:bg-white/[0.05]" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-9 flex-1 rounded-lg bg-muted/50 dark:bg-white/[0.06]" />
                                <Skeleton className="h-9 w-9 rounded-lg bg-muted/50 dark:bg-white/[0.06]" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter Bar */}
            <Skeleton className="h-12 w-full rounded-xl bg-muted/40 dark:bg-white/[0.04]" />

            {/* Submissions Table */}
            <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50 dark:bg-white/[0.01]">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="w-[180px]"><Skeleton className="h-3.5 w-20 bg-muted/60 dark:bg-white/[0.07]" /></TableHead>
                            <TableHead className="w-[220px]"><Skeleton className="h-3.5 w-24 bg-muted/60 dark:bg-white/[0.07]" /></TableHead>
                            <TableHead><Skeleton className="h-3.5 w-32 bg-muted/60 dark:bg-white/[0.07]" /></TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <TableRow key={i} className="border-border/50 hover:bg-transparent">
                                <TableCell>
                                    <Skeleton className="h-4 w-32 bg-muted/50 dark:bg-white/[0.06]" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-40 bg-muted/40 dark:bg-white/[0.05]" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2 flex-wrap">
                                        <Skeleton className="h-5 w-20 rounded-full bg-muted/50 dark:bg-white/[0.06]" />
                                        <Skeleton className="h-5 w-24 rounded-full bg-muted/40 dark:bg-white/[0.05]" />
                                        <Skeleton className="h-5 w-16 rounded-full bg-muted/30 dark:bg-white/[0.04]" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-7 w-7 rounded-md bg-muted/40 dark:bg-white/[0.05]" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
