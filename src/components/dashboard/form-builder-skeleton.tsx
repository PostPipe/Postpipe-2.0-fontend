
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function FormBuilderSkeleton() {
    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 p-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" disabled>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="ml-auto flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Builder */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="grid gap-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="grid gap-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-3 w-64" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-8 w-24" />
                        </div>

                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="p-4 flex gap-4 items-start">
                                        <div className="mt-3">
                                            <Skeleton className="h-4 w-4" />
                                        </div>
                                        <div className="grid gap-4 flex-1 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-12" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-12" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview/Code */}
                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-md bg-muted/20">
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
