"use client";

import { useState, useMemo } from "react";
import {
    Copy, ExternalLink, GitPullRequest, Maximize2,
    Calendar, Search, Sparkles, Check, Tag, ChevronRight,
    Layers, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StrokeText from "./StrokeText";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type ReleaseItem = {
    version: string;
    title: string;
    date: string;
    image: string;
    excerpt: string;
    tags: string[];
    isLatest?: boolean;
    contributors: string[];
    content: React.ReactNode;
};

const releases: ReleaseItem[] = [
    {
        version: "v3.1.0",
        title: "v3.1.0: Documentation Overhaul, UI Fixes & Stability Improvements",
        date: "September 12, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1789191712/8da1a117-f42e-411d-9b10-066430ee2c52.png",
        excerpt:
            "A comprehensive update featuring a completely rewritten documentation site, fixes for Next.js 15 CSR bailouts, resolved form deletion bugs, and mobile UI enhancements.",
        tags: ["Documentation", "Bug Fixes", "UI Enhancements", "Next.js"],
        isLatest: true,
        contributors: [
            "https://github.com/Sourodip-1",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Documentation Overhaul</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    The entire documentation section has been rewritten to adopt a clean, minimal SaaS aesthetic. Emojis and casual phrasing have been removed to ensure a professional developer experience.
                </p>
                <h3 className="text-xl font-bold text-foreground pt-3">UI & Stability Fixes</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Form Deletion</strong>: Fixed the 404 error during form submission deletion by correctly passing form identifiers to the database adapter.</li>
                    <li><strong>Next.js 15 Fixes</strong>: Wrapped components using <code>useSearchParams</code> in Suspense boundaries to prevent static prerendering build failures, and removed global scroll-smooth rules causing warnings.</li>
                    <li><strong>Mobile Dashboard</strong>: Resolved horizontal overflow and truncation issues in the Connectors and Forms client tables.</li>
                    <li><strong>Accessibility</strong>: Fixed Radix UI warnings in the mobile Docs navigation by adding hidden title and description elements.</li>
                    <li><strong>Forge Desktop UI</strong>: Restored the missing ExploreSidebar and search icon in the desktop view.</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v3.0.0",
        title: "v3.0.0: New Form Builder, Connector Verification & Riven Deploy Partnership",
        date: "August 17, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1786981389/36f21d7a-f2f2-4c6a-9383-92d0e1e4fd62.png",
        excerpt:
            "A massive update featuring a completely redesigned Form Builder, new connector verification flows, and an official partnership with Riven Deploy for seamless 1-click deployments.",
        tags: ["Major Release", "Form Builder", "Partnership", "Verification"],
        contributors: [
            "https://github.com/Sourodip-1",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Postpipe x Riven Deploy Partnership</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    We are thrilled to announce our official partnership with <strong>Riven Deploy</strong>!
                    You can now deploy your FastAPI and Express connectors directly to Riven&apos;s high-performance infrastructure with a single click.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>1-Click Deployments</strong>: Integrated Riven Deploy button directly in the new connector setup wizard.</li>
                    <li><strong>Optimized Infrastructure</strong>: Riven Deploy is perfectly tuned for Postpipe&apos;s connector architecture, ensuring maximum uptime and minimal latency.</li>
                </ul>
                <h3 className="text-xl font-bold text-foreground pt-3">Form Builder Redesign</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    The Form Builder has been completely overhauled for a cleaner, premium SaaS feel.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Wizard Layout</strong>: A new step-by-step wizard layout for maximum focus, with a top stepper and a unified, clean interface.</li>
                    <li><strong>SaaS Aesthetic</strong>: Darker, cleaner interface dropping the complex AI styling for a more professional, polished look.</li>
                </ul>
                <h3 className="text-xl font-bold text-foreground pt-3">Connector Verification</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Added a powerful new verification process for Connectors.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Live Verification</strong>: You can now verify that your deployed connector is reachable and correctly configured directly from the dashboard.</li>
                    <li><strong>Status Tracking</strong>: Instant visual feedback with &quot;Verified&quot; and &quot;Not Verified&quot; status badges to keep track of your infrastructure.</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v2.2.1",
        title: "v2.2.1: Static Connector Page — New UI",
        date: "March 05, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1772691336/bc797958-6363-4f3a-9e29-fe8dbe027384.png",
        excerpt:
            "Complete visual overhaul of the /static connector setup page by Souvik — featuring a live WebGL shader background, glassmorphism step wizard, and smooth edge vignette dissolve.",
        tags: ["WebGL Shader", "Glassmorphism", "Static Ingest"],
        contributors: [
            "https://github.com/souvikvos",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Static Connector Page — New UI</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Contribution by <strong>Souvik</strong>. The <code>/static</code> onboarding page has been rebuilt from the ground up
                    to deliver a premium first-impression for new users setting up their connector.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>WebGL Shader Background</strong>: A live Three.js fractal ring animation fills the full page, giving an immersive depth to the setup flow.</li>
                    <li><strong>Glassmorphism Step Wizard</strong>: The setup card uses <code>backdrop-blur-2xl</code> with a frosted dark overlay and violet accent progress indicator across three clear steps: Generate → Deploy → Connect.</li>
                    <li><strong>Vignette Edge Dissolve</strong>: Multi-layer radial + linear gradients fade the shader seamlessly into the page background on all sides — no hard cutoff edges.</li>
                    <li><strong>Refined Env Var Display</strong>: Sensitive connector secrets use a hover-reveal interaction so they aren&apos;t exposed at a glance.</li>
                    <li><strong>Deployment Target Cards</strong>: Vercel and Azure deployment options are now visually distinct selectable cards.</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v2.2.0",
        title: "v2.2.0: Static Dashboard & UX Overhaul",
        date: "March 05, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1772690437/edbdae56-1562-4160-a071-3c9ea33e2c51.png",
        excerpt:
            "Complete redesign of the /static setup wizard with a live WebGL shader background, Cloudinary image-upload guidance, searchable field-type dropdown, and refined skeleton loaders.",
        tags: ["Dashboard UX", "Searchable Inputs", "Skeletons"],
        contributors: [
            "https://github.com/Sourodip-1",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Static Setup Wizard Redesign</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    The <code>/static</code> connector setup page has been completely redesigned by <strong>Sourodip</strong>. It now features a live Three.js WebGL shader animation as the full-page background with a glassmorphism frosted-glass card overlay.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Shader Background</strong>: Full-screen fractal ring WebGL animation via Three.js with proper cleanup and resize handling.</li>
                    <li><strong>Glassmorphism Card</strong>: <code>backdrop-blur-2xl</code> frosted card with violet accent progress bar and step indicators.</li>
                    <li><strong>Edge Vignette</strong>: Multi-layer radial + linear gradient overlays to fade the shader softly into the dark page on all sides.</li>
                </ul>
                <h3 className="text-xl font-bold text-foreground pt-3">Form Builder Improvements</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Searchable Type Dropdown</strong>: Live search input at the top of the field-type selector — filters across all categories in real time.</li>
                    <li><strong>Cloudinary Notice</strong>: An amber alert banner auto-appears in the Fields panel whenever an image field is added, showing all required <code>CLOUDINARY_*</code> env vars.</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v2.1.0",
        title: "v2.1.0: CCDRS (Cross Database Data Routing System)",
        date: "February 07, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1770438091/postpipe_postgres_nap4nn.png",
        excerpt:
            "Implemented CCDRS - A high-performance routing layer that allows a single connector to dynamically bridge data across multiple physical databases.",
        tags: ["CCDRS", "Multi-Database", "Architecture"],
        contributors: [
            "https://github.com/Sourodip-1",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Cross Database Data Routing System (CCDRS)</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    PostPipe 2.0 now supports native data routing across multiple databases from a single connector instance. This contribution by <strong>Sourodip</strong> enables enterprise-grade data orchestration without additional infrastructure.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Dynamic Routing</strong>: Map form submissions to specific databases using environment variable suffixes.</li>
                    <li><strong>Smart Resolution</strong>: Automatic detection of database types (Mongo/Postgres) per-request.</li>
                    <li><strong>Zero Latency Proxy</strong>: High-efficiency data tunneling to local VPC databases.</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v2.0.2",
        title: "v2.0.2: Docs Update",
        date: "January 10, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1768027847/55ac531f-1cdd-434f-8417-159d5afb94ae.png",
        excerpt:
            "Documentation Overhaul: Unified Glassmorphism Theme & New Architecture Guides.",
        tags: ["Documentation", "Design System"],
        contributors: [
            "https://github.com/Sourodip-1",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Documentation Visual Refresh</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    We have synchronized the visual theme across the entire documentation suite, bringing the premium &quot;Neural Network&quot; hero and glassmorphism cards to every guide.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Unified Design System</strong>: All docs now share the same immersive 3D background and layouts.</li>
                    <li><strong>New &quot;How It Works&quot; Page</strong>: Added a dedicated guide explaining the Static Tunneling vs. Dynamic CLI architecture.</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v2.0.1",
        title: "v2.0.1: Maintenance Update",
        date: "January 05, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1767630171/ab8d63ac-b9aa-47f6-907e-b5ec392cb596.png",
        excerpt:
            "Added Lazy-Loading and Skeleton Loading For Pages Fetching Database Information.",
        tags: ["Performance", "Lazy Loading"],
        contributors: [
            "https://github.com/yo-soyam",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Lazy-Loading and Skeleton</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    This release focuses on speed improvements across overall website load times.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li>Resolved Loading Speed Problems</li>
                    <li>Added Lazy-Loading</li>
                    <li>Added Skeletal-Loading</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v2.0.0",
        title: "v2.0.0: Per-Connector Database Routing",
        date: "January 04, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1767534741/967e77cc-ef30-4ec9-b086-97fbbf903710.png",
        excerpt:
            "Major refactoring introduces per-connector database configuration, removing global routing rules and enabling granular database management for each connector instance.",
        tags: ["Major Release", "Routing", "Architecture"],
        contributors: [
            "https://github.com/souvikvos",
            "https://github.com/yo-soyam",
            "https://github.com/Sourodip-1",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Per-Connector Database Management</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Complete overhaul of the database configuration system. Each connector now manages its own database aliases independently.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li>Removed global routing rules in favor of connector-specific configuration</li>
                    <li>New dedicated Database page for managing connector databases</li>
                    <li>Auto-generated aliases from environment variable names</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v1.5.0",
        title: "v1.5.0: Connector Deployment & Vercel Integration",
        date: "January 03, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1767534536/ea4e6a7c-7478-4321-86cd-0247a2bdaad3.png",
        excerpt:
            "Streamlined connector deployment with native Vercel support, guided setup wizard, and enhanced security features for seamless cloud deployment.",
        tags: ["Vercel", "Serverless", "Deploy Wizard"],
        contributors: [
            "https://github.com/souvikvos",
            "https://github.com/yo-soyam",
            "https://github.com/Sourodip-1",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Vercel-Ready Connectors</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Deploy your connectors to Vercel with a single click. Serverless-compatible architecture ensures scalability and reliability.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li>Vercel deployment configuration included</li>
                    <li>Environment variable-based configuration</li>
                    <li>Serverless function optimization</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v1.2.0",
        title: "v1.2.0: Secure Public API & Zero Data Retention",
        date: "January 02, 2026",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1767534193/c7752202-eeb9-4974-b236-01945ce65a65.png",
        excerpt:
            "Introduced secure public API for fetching form submissions directly from user-deployed connectors with strict zero data retention policy.",
        tags: ["Public API", "Security", "Privacy"],
        contributors: [
            "https://github.com/souvikvos",
            "https://github.com/yo-soyam",
            "https://github.com/Sourodip-1",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Public API Launch</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    New REST API enables secure access to form submissions with robust authentication and authorization.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li>Token-based authentication for API access</li>
                    <li>Dynamic database routing support</li>
                    <li>Zero server-side data storage</li>
                </ul>
            </div>
        ),
    },
    {
        version: "v1.0.0",
        title: "v1.0.0: Postpipe Launch",
        date: "December 25, 2025",
        image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1767532857/45c05d69-7a71-4cf5-b2aa-1bcf2e279ebd_t8asix.jpg",
        excerpt:
            "Official launch of Postpipe - the modern form backend solution with user-controlled data, static workflows, and MongoDB integration.",
        tags: ["Initial Release", "Launch", "MongoDB"],
        contributors: [
            "https://github.com/souvikvos",
            "https://github.com/yo-soyam",
            "https://github.com/Sourodip-1",
        ],
        content: (
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-xl font-bold text-foreground">Core Features</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li>Visual form builder with drag-and-drop interface</li>
                    <li>Static workflows - frontend directly connects to your database</li>
                    <li>MongoDB connector template for easy deployment</li>
                    <li>User profile management API</li>
                </ul>
            </div>
        ),
    },
];

export default function ChangelogComponent() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("All");
    const [copiedVersion, setCopiedVersion] = useState<string | null>(null);

    const copyLink = (version: string) => {
        const url = `${window.location.origin}${window.location.pathname}#${version}`;
        navigator.clipboard.writeText(url);
        setCopiedVersion(version);
        toast({
            title: "Link Copied",
            description: `Copied direct link to ${version} release.`,
        });
        setTimeout(() => setCopiedVersion(null), 2000);
    };

    const scrollToRelease = (version: string) => {
        const el = document.getElementById(version);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const allTags = ["All", "Major Release", "Form Builder", "Connectors", "WebGL Shader", "Architecture", "Performance"];

    const filteredReleases = useMemo(() => {
        return releases.filter(r => {
            const matchesSearch = !searchQuery.trim() ||
                r.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesTag = selectedTag === "All" || r.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());

            return matchesSearch && matchesTag;
        });
    }, [searchQuery, selectedTag]);

    return (
        <div className="flex flex-col gap-6 w-full pb-16">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ══ HERO CARD: FLOATING SAAS CARD ══ */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Subtle Background Pattern & Glow */}
                <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-[0.03]">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="changelog-hero-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.5" className="fill-foreground" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#changelog-hero-pattern)" />
                    </svg>
                </div>
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-3xl pointer-events-none" />

                {/* Left: Title & Info */}
                <div className="relative z-10 flex flex-col gap-3.5 max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 w-fit">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        <span>Postpipe Changelog</span>
                        <span className="text-neutral-500">•</span>
                        <span className="font-mono text-[11px] text-violet-300">v3.0.0 Live</span>
                    </div>

                    {/* StrokeText */}
                    <div className="w-fit min-w-[240px] max-w-xs filter drop-shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                        <StrokeText
                            text="Changelog"
                            strokeColor="#A78BFA"
                            fillColor="#FFFFFF"
                            strokeWidth={1.6}
                            drawDuration={1.3}
                            fillDelay={0.15}
                            stagger={0.06}
                            ease="power2.out"
                            trigger="mount"
                            fillMode="wipe"
                            fontSize={54}
                            fontWeight={800}
                            letterSpacing={-2}
                            fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
                            className="text-foreground"
                        />
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Stay up to date with new features, architecture improvements, and performance releases shipped to Postpipe.
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground pt-1">
                        <span className="flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                            {releases.length} Releases Published
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                            Latest: August 17, 2026
                        </span>
                        <span className="flex items-center gap-1.5">
                            <GitPullRequest className="h-3.5 w-3.5 text-blue-400" />
                            3 Core Contributors
                        </span>
                    </div>
                </div>

                {/* Right: Quick Action Controls */}
                <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 sm:items-end">
                    <Button
                        variant="outline"
                        className="gap-2 h-10 px-4 text-xs font-semibold border-border hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-400"
                        onClick={() => window.open("https://github.com/Sourodip-1/Postpipe-2.0-fontend-/releases", "_blank")}
                    >
                        <ExternalLink className="h-3.5 w-3.5" /> View on GitHub Releases
                    </Button>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>Continuous delivery enabled</span>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ══ TWO-COLUMN CONTENT: FEED + STICKY DIRECTORY ══ */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
                {/* ── LEFT / MAIN TIMELINE FEED ── */}
                <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                    {filteredReleases.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center flex flex-col items-center justify-center gap-3">
                            <p className="text-foreground font-semibold">No updates found</p>
                            <p className="text-muted-foreground text-xs">
                                No release notes match &quot;{searchQuery}&quot; in category &quot;{selectedTag}&quot;.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSearchQuery(""); setSelectedTag("All"); }}
                                className="mt-2 text-xs"
                            >
                                Reset filters
                            </Button>
                        </div>
                    ) : (
                        <div className="relative border-l border-border/70 ml-4 sm:ml-6 space-y-8">
                            {filteredReleases.map((item) => {
                                const versionTag = item.version;

                                return (
                                    <div
                                        key={versionTag}
                                        id={versionTag}
                                        className="relative pl-6 sm:pl-8 group scroll-mt-6"
                                    >
                                        {/* Timeline Node Dot */}
                                        <div className="absolute -left-[9px] top-6 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-border bg-background group-hover:border-violet-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
                                            {item.isLatest ? (
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                                </span>
                                            ) : (
                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 group-hover:bg-violet-400 transition-colors" />
                                            )}
                                        </div>

                                        {/* Release Card */}
                                        <div className="relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:border-violet-500/30 transition-all duration-300 p-6 sm:p-7">
                                            {/* Top Header: Version & Date & Actions */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-tight bg-primary/10 text-primary border border-primary/20">
                                                        {item.version}
                                                    </span>
                                                    {item.isLatest && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <Sparkles className="h-3 w-3" /> Latest
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 opacity-70" />
                                                        {item.date}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-lg hover:text-foreground"
                                                                    onClick={() => copyLink(versionTag)}
                                                                >
                                                                    {copiedVersion === versionTag ? (
                                                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                                    ) : (
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Copy direct link</p>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-lg hover:text-foreground"
                                                                    onClick={() => window.open(`https://github.com/Sourodip-1/Postpipe-2.0-fontend-/releases/tag/${versionTag}`, '_blank')}
                                                                >
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>View on GitHub</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>

                                            {/* Release Title */}
                                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mb-2">
                                                {item.title}
                                            </h2>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {item.tags.map(t => (
                                                    <span
                                                        key={t}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/50"
                                                    >
                                                        <Tag className="h-2.5 w-2.5 opacity-60" />
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Excerpt */}
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                                {item.excerpt}
                                            </p>

                                            {/* Preview Image with Modal Trigger */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="relative cursor-pointer group/img rounded-xl overflow-hidden border border-border bg-muted/20 mb-5 shadow-inner">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="w-full max-h-80 object-cover object-top transition-transform duration-500 group-hover/img:scale-[1.01]"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-4">
                                                            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                                                                <Maximize2 className="h-3.5 w-3.5" /> Click to view full image & notes
                                                            </span>
                                                        </div>
                                                    </div>
                                                </DialogTrigger>

                                                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-border bg-card">
                                                    <DialogHeader>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-primary/10 text-primary">
                                                                {item.version}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">{item.date}</span>
                                                        </div>
                                                        <DialogTitle className="text-left text-xl font-bold">{item.title}</DialogTitle>
                                                        <DialogDescription className="text-left text-sm text-muted-foreground">
                                                            {item.excerpt}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="rounded-xl overflow-hidden border border-border my-2">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="w-full max-h-96 object-cover"
                                                        />
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        {item.content}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {/* Card Footer */}
                                            <div className="flex items-center justify-between pt-4 border-t border-border/60">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-medium text-muted-foreground">Contributors:</span>
                                                    <div className="flex items-center -space-x-1.5">
                                                        {item.contributors.map((src, id) => (
                                                            <a
                                                                key={id}
                                                                href={src}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="transition-transform hover:scale-110 hover:z-10"
                                                            >
                                                                <img
                                                                    src={`${src}.png`}
                                                                    alt="Contributor"
                                                                    className="h-6 w-6 rounded-full border-2 border-card bg-muted object-cover"
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-xs font-semibold gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                                                        >
                                                            <span>Full Notes</span>
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-border bg-card">
                                                        <DialogHeader>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-primary/10 text-primary">
                                                                    {item.version}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">{item.date}</span>
                                                            </div>
                                                            <DialogTitle className="text-left text-xl font-bold">{item.title}</DialogTitle>
                                                            <DialogDescription className="text-left text-sm text-muted-foreground">
                                                                {item.excerpt}
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="rounded-xl overflow-hidden border border-border my-2">
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="w-full max-h-96 object-cover"
                                                            />
                                                        </div>

                                                        <div className="mt-4 pt-4 border-t border-border">
                                                            {item.content}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: STICKY RELEASE DIRECTORY & FILTER (FILLS THE BLANK RIGHT SIDE) ── */}
                <div className="hidden lg:flex flex-col gap-5 lg:col-span-4 sticky top-4">
                    {/* Search & Filter Card */}
                    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Filter Updates
                            </span>
                            {(searchQuery || selectedTag !== "All") && (
                                <button
                                    onClick={() => { setSearchQuery(""); setSelectedTag("All"); }}
                                    className="text-[11px] font-medium text-primary hover:underline"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search by keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 pl-9 text-xs bg-muted/30 border-border rounded-xl"
                            />
                        </div>

                        {/* Category Tags */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-semibold text-muted-foreground">Category</span>
                            <div className="flex flex-wrap gap-1.5">
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${selectedTag.toLowerCase() === tag.toLowerCase()
                                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table of Contents / Version Directory */}
                    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Version Index
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                                {filteredReleases.length} shown
                            </span>
                        </div>

                        <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto pr-1">
                            {releases.map((rel) => (
                                <button
                                    key={rel.version}
                                    onClick={() => scrollToRelease(rel.version)}
                                    className="flex items-center justify-between py-2 px-2.5 rounded-lg text-left text-xs hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                                            {rel.version}
                                        </span>
                                        {rel.isLatest && (
                                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                                                Latest
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                                        {rel.date.split(",")[0]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Community / GitHub Card */}
                    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-5 flex flex-col gap-3 shadow-sm">
                        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                            <Sparkles className="h-4 w-4 text-violet-400" />
                            <span>Contribute to Postpipe</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Have an idea, bug report, or connector request? Join the community on GitHub.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs font-semibold gap-2 border-border hover:bg-violet-500/10 hover:text-violet-400"
                            onClick={() => window.open("https://github.com/Sourodip-1/Postpipe-2.0-fontend-", "_blank")}
                        >
                            <ExternalLink className="h-3.5 w-3.5" /> Open GitHub Repository
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
