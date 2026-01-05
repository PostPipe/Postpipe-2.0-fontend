
import { Skeleton } from "@/components/ui/skeleton";

export function ViewerSkeleton() {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="border-b border-neutral-800 pb-8">
                    <Skeleton className="h-10 w-96 mb-2 bg-neutral-900" />
                    <Skeleton className="h-5 w-full max-w-lg bg-neutral-900" />
                </header>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
                    <div className="grid gap-4">
                        <div>
                            <Skeleton className="h-4 w-32 mb-2 bg-neutral-800" />
                            <Skeleton className="h-10 w-full bg-neutral-950" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-32 mb-2 bg-neutral-800" />
                            <Skeleton className="h-10 w-full bg-neutral-950" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-32 rounded-lg bg-emerald-900/20" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-24 bg-neutral-900" />
                        <Skeleton className="h-6 w-16 bg-neutral-900" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl bg-neutral-900" />
                </div>
            </div>
        </div>
    );
}
