
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function ExploreSkeleton() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>

            {/* Master Templates Section Skeleton */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-40" />
                </div>
                <div className="relative px-12">
                    <div className="flex gap-4 overflow-hidden">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="flex-none w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] overflow-hidden border-primary/20 bg-primary/5">
                                <div className="aspect-video relative bg-muted/50">
                                    <Skeleton className="h-full w-full" />
                                </div>
                                <CardContent className="p-4">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-3 w-8" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newest Section Skeleton */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-24" />

                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="aspect-video relative bg-muted/50">
                                <Skeleton className="h-full w-full" />
                            </div>
                            <CardContent className="p-4">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-3 w-8" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
