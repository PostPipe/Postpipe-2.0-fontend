import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ExploreSidebar } from "@/components/explore/ExploreSidebar"
import { ExploreHeader } from "@/components/explore/ExploreHeader"

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex min-h-screen w-full bg-background pt-16">
                <ExploreSidebar collapsible="offcanvas" />
                <SidebarInset>
                    <ExploreHeader />
                    <div className="flex-1">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
