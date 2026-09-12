"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Book, Terminal, ShieldCheck, HelpCircle, GitBranch, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs/introduction", icon: Book },
      { label: "Choosing Your Path", href: "/docs/guides/choosing-a-path", icon: GitBranch },
    ],
  },
  {
    label: "Guides",
    items: [
      { label: "Static Setup", href: "/docs/guides/static-connector", icon: ShieldCheck },
      { label: "Forge CLI", href: "/docs/guides/cli-components", icon: Terminal },
      { label: "Auth Presets & Aliases", href: "/docs/guides/auth-presets-and-aliases", icon: ShieldCheck },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "How It Works", href: "/docs/how-it-works", icon: HelpCircle },
    ],
  },
];

export default function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navContent = (
    <nav className="py-8 space-y-6">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="text-xs font-semibold text-foreground mb-3 px-2">
            {section.label}
          </p>
          <ul className="space-y-px">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row items-start gap-x-8 px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* ─── Mobile Header ─── */}
      <div className="md:hidden w-full flex items-center mb-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-2">
              <Menu className="h-4 w-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
            <div className="mt-6 overflow-y-auto max-h-[85vh]">
              {navContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ─── Sidebar ─── */}
      <aside
        className="sticky top-[5.5rem] hidden w-[240px] shrink-0 md:block overflow-y-auto"
        style={{ height: "calc(100vh - 6rem)" }}
      >
        {navContent}
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
