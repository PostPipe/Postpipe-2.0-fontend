"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
    Terminal,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getSystems, toggleFavoriteSystem } from "@/lib/actions/systems";
import { ExploreCard } from "@/components/explore/ExploreCard";
import { ExploreModal } from "@/components/explore/ExploreModal";
import { BeamsBackground } from "@/components/ui/beams-background";
import { Particles } from "@/components/ui/particles";
import { useTheme } from "next-themes";

type System = {
    id: string;
    name: string;
    type: string;
    database: string;
    status: "Active" | "Disabled";
    environment: "Dev" | "Prod";
    lastUsed: string;
    isFavorite: boolean;
    image: string;
    author: { name: string; profileUrl?: string };
    tags: string[];
    cli?: string;
    aiPrompt?: string;
    npmPackageUrl?: string;
};

export default function SystemsClient() {
    const [systems, setSystems] = useState<System[]>([]);
    const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
    const [loading, setLoading] = useState(true);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchSystems = async () => {
            try {
                const data = await getSystems();
                setSystems(data as any);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchSystems();
    }, []);

    const toggleFavorite = async (id: string) => {
        // Optimistic update
        setSystems(prev => prev.map(sys =>
            sys.id === id ? { ...sys, isFavorite: !sys.isFavorite } : sys
        ));

        const res = await toggleFavoriteSystem(id);
        if (res.success) {
            toast({ description: "Favorites updated" });
        } else {
            // Revert if failed
            setSystems(prev => prev.map(sys =>
                sys.id === id ? { ...sys, isFavorite: !sys.isFavorite } : sys
            ));
        }
    };

    const sortedSystems = [...systems].sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return 0;
        return a.isFavorite ? -1 : 1;
    });

    return (
        <div className="flex flex-col gap-8">

            {/* Forge Header */}
            <div className="relative w-full rounded-xl overflow-hidden border border-border/50 bg-white dark:bg-neutral-950 shadow-2xl">
                <BeamsBackground className="absolute inset-0 z-0 h-full w-full hidden dark:block" intensity="subtle" />
                <div className="relative z-10 p-8 md:p-16 flex flex-col items-start gap-6">
                    <Particles
                        className="absolute inset-0 z-0 opacity-40"
                        quantity={100}
                        ease={80}
                        color={mounted && resolvedTheme === "dark" ? "#ffffff" : "#000000"}
                        refresh
                    />
                    <div className="flex flex-col gap-3 relative z-10 max-w-3xl">
                        <div className="inline-flex items-center rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-3 py-1 text-xs font-medium text-neutral-900 dark:text-white backdrop-blur-md w-fit mb-2">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                            Release 2.0
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-neutral-900 dark:text-white drop-shadow-sm">
                            Forge
                            <span className="text-primary">.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
                            Build, ship, and scale your backend with production-ready templates.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-neutral-950 to-transparent pointer-events-none" />
            </div>

            <div className="flex justify-end -mt-4 mb-2 relative z-10">
                <Link href="/explore">
                    <RainbowButton className="h-9 px-4 text-xs text-white w-full md:w-auto">
                        <Terminal className="mr-2 h-3.5 w-3.5" />
                        <span className="whitespace-pre-wrap text-center font-medium leading-none tracking-tight">
                            New System
                        </span>
                    </RainbowButton>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10 text-muted-foreground">Loading specific systems...</div>
            ) : systems.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No Backend Systems</h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-4">
                        You haven&apos;t added any systems yet. Explore templates to add one.
                    </p>
                    <Link href="/explore">
                        <Button variant="outline">Browse Templates</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedSystems.map((system) => (
                        <div key={system.id} className="relative group">
                            <ExploreCard
                                title={system.name}
                                image={system.image}
                                author={{ name: system.author.name, avatar: system.author.profileUrl }}
                                tags={[system.status, system.environment, ...system.tags].slice(0, 3)}
                                onClick={() => setSelectedSystem(system)}
                            />
                            {/* Optional: Add a subtle favorite button overlay? User didn't ask explicitly but it was there */}
                        </div>
                    ))}
                </div>
            )}

            <ExploreModal
                open={!!selectedSystem}
                onOpenChange={(open) => !open && setSelectedSystem(null)}
                item={selectedSystem ? {
                    id: selectedSystem.id,
                    title: selectedSystem.name,
                    author: {
                        name: selectedSystem.author.name,
                        avatar: selectedSystem.author.profileUrl
                    },
                    image: selectedSystem.image,
                    tags: selectedSystem.tags,
                    cli: selectedSystem.cli,
                    aiPrompt: selectedSystem.aiPrompt,
                    npmPackageUrl: selectedSystem.npmPackageUrl
                } : null}
            />
        </div>
    );
}
