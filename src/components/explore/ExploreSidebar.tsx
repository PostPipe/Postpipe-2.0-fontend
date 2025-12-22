"use client"

import * as React from "react"
import {
    BookOpen,
    Box,
    CheckCircle2,
    LayoutTemplate,
    Lock,
    Search,
    Settings2,
    Sparkles,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

type CategoryItem = {
    title: string
    url: string
    icon: React.ElementType
    badge?: string
}

type CategoryGroup = {
    title: string
    items: CategoryItem[]
}

const categories: CategoryGroup[] = [
    {
        title: "Components",
        items: [
            {
                title: "Master Template",
                url: "#",
                icon: LayoutTemplate,
            },
            {
                title: "Auth Systems",
                url: "#",
                icon: Lock,
            },
            {
                title: "Utilities",
                url: "#",
                icon: Settings2,
            },
            {
                title: "Verification",
                url: "#",
                icon: CheckCircle2,
            },
            {
                title: "Marketing Blocks",
                url: "#",
                icon: Box,
            },
        ],
    },
    {
        title: "Discover",
        items: [
            {
                title: "Feed",
                url: "#",
                icon: Sparkles,
                badge: "Beta",
            },
            {
                title: "Best of the Week",
                url: "#",
                icon: BookOpen,
                badge: "New",
            },
        ],
    },
]


import { Button } from "@/components/ui/button"
import { SearchPopup } from "./SearchPopup"

export function ExploreSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [searchOpen, setSearchOpen] = React.useState(false)

    return (
        <>
            <Sidebar {...props}>
                <SidebarHeader>
                    <div className="px-2 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight px-2">21st.dev</h2>
                        <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Search className="h-4 w-4" />
                            <span className="sr-only">Search</span>
                        </Button>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    {categories.map((group) => (
                        <SidebarGroup key={group.title}>
                            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <a href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                </SidebarContent>
                <SidebarRail />
            </Sidebar>
            <SearchPopup open={searchOpen} setOpen={setSearchOpen} />
        </>
    )
}
