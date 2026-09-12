"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as Dialog from "@radix-ui/react-dialog"
import {
    X,
    Copy,
    Check,
    Terminal,
    ExternalLink,
    Database,
    Sparkles,
    Layers,
    Tag,
    Share2,
    Code2,
    Cpu,
    ArrowUpRight,
    ShieldCheck,
    Play,
    Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createSystem } from "@/lib/actions/systems"
import databases from "@/data/databases.json"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { BorderBeam } from "@/components/ui/border-beam"
import { GridPattern } from "@/components/ui/grid-pattern"
import { ShinyText } from "@/components/ui/shiny-text"

interface ExploreModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    item: {
        id?: string
        title: string
        category?: string
        author: {
            name: string
            avatar?: string
            handle?: string
        }
        image: string
        tags?: string[]
        cli?: string
        aiPrompt?: string
        npmPackageUrl?: string
        databaseConfigurations?: {
            databaseName: string
            logo: string
            prompt: string
        }[]
    } | null
}

export function ExploreModal({ open, onOpenChange, item }: ExploreModalProps) {
    const { toast } = useToast()
    const [selectedDb, setSelectedDb] = React.useState<string>("")
    const [copiedType, setCopiedType] = React.useState<string | null>(null)
    const [isPromptExpanded, setIsPromptExpanded] = React.useState(false)
    const itemId = item?.id

    React.useEffect(() => {
        if (!open) {
            setSelectedDb("")
            setCopiedType(null)
            setIsPromptExpanded(false)
        }
    }, [open, itemId])

    // Lock background scroll safely when modal is open
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
            if (typeof window !== "undefined") {
                if (typeof (window as any).__lenis?.stop === "function") {
                    (window as any).__lenis.stop()
                }
            }
        } else {
            document.body.style.overflow = ""
            if (typeof window !== "undefined") {
                if (typeof (window as any).__lenis?.start === "function") {
                    (window as any).__lenis.start()
                }
            }
        }

        return () => {
            document.body.style.overflow = ""
            if (typeof window !== "undefined") {
                if (typeof (window as any).__lenis?.start === "function") {
                    (window as any).__lenis.start()
                }
            }
        }
    }, [open])

    if (!item) return null

    const handleCopy = async (text: string | undefined, type: string, stateKey?: string) => {
        if (!text) return
        try {
            await navigator.clipboard.writeText(text)
            if (stateKey) {
                setCopiedType(stateKey)
                setTimeout(() => setCopiedType(null), 2000)
            }
            toast({
                title: "Copied to clipboard!",
                description: `${type} copied.`,
            })
            if (item.id) {
                await createSystem(item.title, item.tags?.[0] || item.category || "Application", item.id)
            }
        } catch (err) {
            console.error("Failed to copy", err)
        }
    }

    const handleOpenPackage = async () => {
        if (item.npmPackageUrl) {
            if (item.id) {
                await createSystem(item.title, item.tags?.[0] || item.category || "Application", item.id)
            }
            window.open(item.npmPackageUrl, "_blank")
        }
    }

    const handleSelectDatabase = (val: string) => {
        setSelectedDb(val)
        const config = item.databaseConfigurations?.find(
            (c) => c.databaseName?.toLowerCase() === val?.toLowerCase()
        )
        const promptToCopy = config?.prompt || `${item.aiPrompt || item.title} configured with ${val}`
        handleCopy(promptToCopy, `${val} connection prompt`, `db-${val}`)
    }

    const isVideo =
        item.image &&
        (item.image.includes("jumpshare") ||
            item.image.includes("cloudfront") ||
            item.image.endsWith(".mp4") ||
            item.image.endsWith(".webm") ||
            !/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(item.image))

    // Consolidated database list
    const availableDbs =
        item.databaseConfigurations && item.databaseConfigurations.length > 0
            ? item.databaseConfigurations.map((db) => ({
                  name: db.databaseName,
                  logo: db.logo || databases.find((d) => d.name.toLowerCase() === db.databaseName.toLowerCase())?.logo || "",
                  prompt: db.prompt,
              }))
            : databases

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 pointer-events-none">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: 15 }}
                                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-full max-w-5xl max-h-[88vh] h-auto overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl shadow-2xl pointer-events-auto flex flex-col relative my-auto"
                                >
                                    {/* Ambient Grid Texture Background */}
                                    <GridPattern
                                        width={28}
                                        height={28}
                                        className="opacity-30 dark:opacity-25"
                                    />

                                    {/* Top Navigation / Header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md sticky top-0 z-20 gap-3">
                                        {/* Left Author & Title Info */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 rounded-xl border border-neutral-200 dark:border-white/10 shrink-0">
                                                <AvatarImage
                                                    src={item.author.avatar}
                                                    alt={item.title}
                                                    className={cn(
                                                        "object-cover",
                                                        item.author.name === "PostPipe" && "invert dark:invert-0"
                                                    )}
                                                />
                                                <AvatarFallback className="rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold">
                                                    {item.title.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Dialog.Title className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate">
                                                        {item.title}
                                                    </Dialog.Title>
                                                    {item.category && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="hidden sm:inline-flex bg-primary/10 text-primary border border-primary/20 text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0"
                                                        >
                                                            <ShinyText disabled={false} speed={4} className="text-primary text-[11px]">
                                                                {item.category}
                                                            </ShinyText>
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Dialog.Description className="sr-only">
                                                    Details, preview and configuration for {item.title} template.
                                                </Dialog.Description>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                    <span>By {item.author.name}</span>
                                                    <span className="text-neutral-400">•</span>
                                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                        <ShieldCheck className="w-3 h-3" /> Production Ready
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Toolbar Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {item.npmPackageUrl && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-3 gap-1.5 rounded-lg text-xs font-medium border-neutral-200 dark:border-white/10 hover:border-primary/40 transition-all active:scale-95"
                                                    onClick={handleOpenPackage}
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>Package</span>
                                                </Button>
                                            )}

                                            {/* Close Dialog Button */}
                                            <Dialog.Close asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                    <span className="sr-only">Close</span>
                                                </Button>
                                            </Dialog.Close>
                                        </div>
                                    </div>

                                    {/* Main Scrollable Split Body */}
                                    <div className="overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6 relative z-10">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                            {/* LEFT COLUMN: Media Showcase & Tags (7 cols) */}
                                            <div className="lg:col-span-7 flex flex-col gap-5">
                                                {/* Framed Media Container with React Bits BorderBeam */}
                                                <div className="relative w-full aspect-video sm:aspect-[16/10] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-xl group">
                                                    {isVideo ? (
                                                        <video
                                                            src={item.image}
                                                            className="w-full h-full object-cover"
                                                            autoPlay
                                                            muted
                                                            loop
                                                            playsInline
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full relative">
                                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.15),rgba(255,255,255,0))]" />
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover relative z-10"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-sm">
                                                                    Preview Showcase
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Animated Glowing Border via React Bits BorderBeam */}
                                                    <BorderBeam
                                                        size={90}
                                                        duration={7}
                                                        colorFrom="#a855f7"
                                                        colorTo="#3b82f6"
                                                        borderWidth={1.5}
                                                    />
                                                </div>

                                                {/* Tags & Architecture Cloud */}
                                                {item.tags && item.tags.length > 0 && (
                                                    <div className="flex flex-col gap-2.5">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                                            <Tag className="w-3.5 h-3.5 text-primary" />
                                                            <span>Technologies & Components</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.tags.map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-default"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* RIGHT COLUMN: Specifications, AI Prompt, Databases & CLI (5 cols) */}
                                            <div className="lg:col-span-5 flex flex-col gap-4">
                                                {/* Overview Card with SpotlightCard */}
                                                <SpotlightCard
                                                    spotlightColor="rgba(168, 85, 247, 0.14)"
                                                    className="p-4 border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70"
                                                >
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Layers className="w-4 h-4 text-primary" />
                                                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                                    System Architecture
                                                                </h4>
                                                            </div>
                                                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                                Standard v2.0
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            Pre-configured modular backend with live database connectors, authentication, and static ingest hooks.
                                                        </p>
                                                    </div>
                                                </SpotlightCard>

                                                {/* Supported Databases with Dropdown Select */}
                                                <SpotlightCard
                                                    spotlightColor="rgba(59, 130, 246, 0.12)"
                                                    className="p-4 border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70"
                                                >
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Database className="w-4 h-4 text-blue-500" />
                                                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                                    Database Integrations
                                                                </h4>
                                                            </div>
                                                            {selectedDb && (
                                                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                    <Check className="w-3 h-3" /> Configured
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* DB Dropdown Selector */}
                                                        <div className="w-full">
                                                            <Select value={selectedDb} onValueChange={handleSelectDatabase}>
                                                                <SelectTrigger className="h-10 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200 dark:border-white/10 px-3 text-xs font-medium hover:border-primary/50 transition-all text-neutral-900 dark:text-white">
                                                                    <div className="flex items-center gap-2 truncate">
                                                                        {(() => {
                                                                            const activeDb = availableDbs.find((d) => d.name.toLowerCase() === selectedDb.toLowerCase());
                                                                            if (activeDb) {
                                                                                return (
                                                                                    <>
                                                                                        {activeDb.logo ? (
                                                                                            <img
                                                                                                src={activeDb.logo}
                                                                                                alt={activeDb.name}
                                                                                                className="h-4 w-4 shrink-0 object-contain"
                                                                                            />
                                                                                        ) : (
                                                                                            <Database className="h-4 w-4 text-primary shrink-0" />
                                                                                        )}
                                                                                        <span className="font-semibold text-xs truncate">
                                                                                            {activeDb.name}
                                                                                        </span>
                                                                                    </>
                                                                                );
                                                                            }
                                                                            return (
                                                                                <>
                                                                                    <Database className="h-4 w-4 text-muted-foreground shrink-0" />
                                                                                    <span className="text-muted-foreground text-xs font-medium">
                                                                                        Select database to configure...
                                                                                    </span>
                                                                                </>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900">
                                                                    {availableDbs.map((db) => (
                                                                        <SelectItem
                                                                            key={db.name}
                                                                            value={db.name}
                                                                            className="cursor-pointer text-xs"
                                                                        >
                                                                            <div className="flex items-center gap-2.5 py-0.5">
                                                                                {db.logo ? (
                                                                                    <img
                                                                                        src={db.logo}
                                                                                        alt={db.name}
                                                                                        className="h-4 w-4 shrink-0 object-contain"
                                                                                    />
                                                                                ) : (
                                                                                    <Database className="h-4 w-4 text-primary" />
                                                                                )}
                                                                                <span className="font-medium">{db.name}</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </SpotlightCard>

                                                {/* AI System Prompt Snippet */}
                                                {item.aiPrompt && (
                                                    <SpotlightCard
                                                        spotlightColor="rgba(236, 72, 153, 0.12)"
                                                        className="p-4 border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70"
                                                    >
                                                        <div className="flex flex-col gap-2.5">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Sparkles className="w-4 h-4 text-pink-500" />
                                                                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                                        AI System Prompt
                                                                    </h4>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(item.aiPrompt, "AI Prompt", "ai-prompt")}
                                                                    className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                                                                >
                                                                    {copiedType === "ai-prompt" ? (
                                                                        <>
                                                                            <Check className="w-3 h-3 text-emerald-500" />
                                                                            <span>Copied!</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Copy className="w-3 h-3" />
                                                                            <span>Copy Prompt</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div
                                                                onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                                                                className={cn(
                                                                    "p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-950 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 leading-relaxed cursor-pointer select-text transition-all",
                                                                    isPromptExpanded ? "line-clamp-none" : "line-clamp-3"
                                                                )}
                                                                title="Click to expand/collapse prompt"
                                                            >
                                                                {item.aiPrompt}
                                                            </div>
                                                        </div>
                                                    </SpotlightCard>
                                                )}

                                                {/* CLI Command Box */}
                                                {item.cli && (
                                                    <SpotlightCard
                                                        spotlightColor="rgba(16, 185, 129, 0.12)"
                                                        className="p-4 border border-neutral-200 dark:border-white/10 bg-neutral-950 text-white"
                                                    >
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Terminal className="w-4 h-4 text-emerald-400" />
                                                                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                                                                        Terminal Command
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(item.cli, "CLI command", "body-cli")}
                                                                    className="p-1.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                                                                    title="Copy Command"
                                                                >
                                                                    {copiedType === "body-cli" ? (
                                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                                    ) : (
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="font-mono text-xs text-emerald-400 bg-black/50 p-2.5 rounded-lg border border-white/5 overflow-x-auto select-all">
                                                                {item.cli}
                                                            </div>
                                                        </div>
                                                    </SpotlightCard>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    )
}
