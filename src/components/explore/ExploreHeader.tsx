"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PanelLeft, Search } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { SearchPopup } from "./SearchPopup"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ExploreHeader() {
    const { toggleSidebar } = useSidebar()
    const [searchOpen, setSearchOpen] = React.useState(false)

    return (
        <TooltipProvider>
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all">
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => toggleSidebar()} className="-ml-1 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent hover:shadow-[0_0_20px_-5px_hsl(var(--foreground)/0.3)] transition-all duration-300">
                                <PanelLeft className="h-5 w-5" />
                                <span className="sr-only">Toggle Sidebar</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle Sidebar</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent hover:shadow-[0_0_20px_-5px_hsl(var(--foreground)/0.3)] transition-all duration-300">
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Search components (⌘K)</TooltipContent>
                    </Tooltip>

                    <div className="hidden md:flex ml-2 font-medium text-sm text-foreground/80">
                        Explore
                    </div>
                </div>

                <SearchPopup open={searchOpen} setOpen={setSearchOpen} />
            </header>
        </TooltipProvider>
    )
}
