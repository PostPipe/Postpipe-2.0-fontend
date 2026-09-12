"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard } from "lucide-react";
import { SearchPopup } from "./SearchPopup";
import { Button } from "@/components/ui/button";

export function ExploreMobileNav() {
    const router = useRouter();
    const [searchPopupOpen, setSearchPopupOpen] = useState(false);

    return (
        <>
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center gap-2">
                <div 
                    onClick={() => setSearchPopupOpen(true)}
                    className="flex-1 relative flex items-center bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden h-14 cursor-text"
                >
                    <Search className="absolute left-4 h-5 w-5 text-neutral-500" />
                    <span className="w-full pl-11 pr-4 text-sm sm:text-base text-neutral-500">
                        Search templates...
                    </span>
                </div>

                <div className="flex-shrink-0">
                    <Button 
                        onClick={() => router.push("/dashboard")}
                        size="icon"
                        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-[0_8px_30px_rgba(147,51,234,0.3)] hover:bg-primary/90 flex-shrink-0 border-2 border-white/10"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <SearchPopup open={searchPopupOpen} setOpen={setSearchPopupOpen} />
        </>
    );
}
