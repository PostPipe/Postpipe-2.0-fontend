import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8 animate-pulse">
            {/* Header Area */}
            <div className="space-y-3">
                <Skeleton className="h-10 w-64 bg-muted/60 dark:bg-muted/20" />
                <Skeleton className="h-5 w-96 max-w-full bg-muted/40 dark:bg-muted/10" />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-border/50 bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24 bg-muted/60 dark:bg-muted/20" />
                            <Skeleton className="h-4 w-4 rounded-full bg-muted/60 dark:bg-muted/20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2 bg-muted/60 dark:bg-muted/20" />
                            <Skeleton className="h-3 w-32 bg-muted/40 dark:bg-muted/10" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions / Connectors */}
            <div className="space-y-4">
                <Skeleton className="h-7 w-40 bg-muted/60 dark:bg-muted/20" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl bg-muted/40 dark:bg-muted/10" />
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <Skeleton className="h-7 w-40 bg-muted/60 dark:bg-muted/20" />
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full bg-muted/60 dark:bg-muted/20" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-40 bg-muted/60 dark:bg-muted/20" />
                                            <Skeleton className="h-3 w-24 bg-muted/40 dark:bg-muted/10" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-3 w-20 bg-muted/40 dark:bg-muted/10 hidden sm:block" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
