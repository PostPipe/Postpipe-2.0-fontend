"use client"

import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
    Layout,
    Layers,
    Box,
    Sparkles,
    Image as ImageIcon,
    Type,
    MousePointer2
} from "lucide-react"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SearchPopupProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SearchPopup({ open, setOpen }: SearchPopupProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0 shadow-2xl bg-zinc-950 border-zinc-800 sm:rounded-2xl max-w-4xl max-h-[80vh]">
                <DialogTitle className="sr-only">Search</DialogTitle>
                <Command className="bg-transparent text-white h-full w-full flex flex-col [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-4 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-4 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">

                    <div className="flex items-center border-b border-zinc-800 px-3">
                        <Search className="mr-2 h-5 w-5 shrink-0 opacity-50 text-zinc-400" />
                        <CommandInput
                            placeholder="Search components, screens, themes..."
                            className="flex h-14 w-full rounded-md bg-transparent py-3 outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 text-base"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-4 pb-2 border-b border-zinc-800/50">
                        <Button variant="secondary" size="sm" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700 h-8 rounded-full px-4 text-xs font-normal">
                            <Layout className="mr-2 h-3.5 w-3.5" />
                            Components
                        </Button>
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100 h-8 px-4 text-xs font-normal hover:bg-zinc-900 rounded-full">
                            Featured
                        </Button>
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100 h-8 px-4 text-xs font-normal hover:bg-zinc-900 rounded-full">
                            Newest
                        </Button>
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100 h-8 px-4 text-xs font-normal hover:bg-zinc-900 rounded-full">
                            Bookmarks
                        </Button>
                    </div>

                    <CommandList className="max-h-[600px] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                        <CommandEmpty className="text-zinc-500 text-sm py-12 text-center flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 opacity-20" />
                            <p>No results found.</p>
                        </CommandEmpty>

                        <CommandGroup heading="Featured" className="[&_[cmdk-group-items]]:grid [&_[cmdk-group-items]]:grid-cols-2 md:[&_[cmdk-group-items]]:grid-cols-4 [&_[cmdk-group-items]]:gap-3 pb-6">
                            <CommandItem onSelect={() => { }} className="cursor-pointer flex flex-col items-start gap-4 p-4 h-32 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all group aria-selected:bg-zinc-800 aria-selected:border-zinc-700">
                                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                                    <Layout className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-zinc-200">Heroes</p>
                                    <p className="text-xs text-zinc-500 line-clamp-1">Header sections for landing pages</p>
                                </div>
                            </CommandItem>

                            <CommandItem onSelect={() => { }} className="cursor-pointer flex flex-col items-start gap-4 p-4 h-32 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all group aria-selected:bg-zinc-800 aria-selected:border-zinc-700">
                                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                                    <Layers className="h-5 w-5 text-pink-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-zinc-200">Backgrounds</p>
                                    <p className="text-xs text-zinc-500 line-clamp-1">Animated patterns and gradients</p>
                                </div>
                            </CommandItem>

                            <CommandItem onSelect={() => { }} className="cursor-pointer flex flex-col items-start gap-4 p-4 h-32 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all group aria-selected:bg-zinc-800 aria-selected:border-zinc-700">
                                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                                    <Box className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-zinc-200">Features</p>
                                    <p className="text-xs text-zinc-500 line-clamp-1">Feature grids and showcases</p>
                                </div>
                            </CommandItem>

                            <CommandItem onSelect={() => { }} className="cursor-pointer flex flex-col items-start gap-4 p-4 h-32 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all group aria-selected:bg-zinc-800 aria-selected:border-zinc-700">
                                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                                    <Sparkles className="h-5 w-5 text-amber-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-zinc-200">Announcements</p>
                                    <p className="text-xs text-zinc-500 line-clamp-1">Banners and tickers</p>
                                </div>
                            </CommandItem>
                        </CommandGroup>

                        <CommandGroup heading="Components" className="[&_[cmdk-group-items]]:grid [&_[cmdk-group-items]]:grid-cols-2 md:[&_[cmdk-group-items]]:grid-cols-4 [&_[cmdk-group-items]]:gap-3">
                            <CommandItem onSelect={() => { }} className="cursor-pointer flex flex-col items-start gap-4 p-4 h-32 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all group aria-selected:bg-zinc-800 aria-selected:border-zinc-700">
                                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                                    <CreditCard className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-zinc-200">Cards</p>
                                    <p className="text-xs text-zinc-500 line-clamp-1">Interactive card layouts</p>
                                </div>
                            </CommandItem>
                            <CommandItem onSelect={() => { }} className="cursor-pointer flex flex-col items-start gap-4 p-4 h-32 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all group aria-selected:bg-zinc-800 aria-selected:border-zinc-700">
                                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                                    <Smile className="h-5 w-5 text-violet-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-zinc-200">AI Chats</p>
                                    <p className="text-xs text-zinc-500 line-clamp-1">Chat interfaces</p>
                                </div>
                            </CommandItem>
                            <CommandItem onSelect={() => { }} className="cursor-pointer flex flex-col items-start gap-4 p-4 h-32 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all group aria-selected:bg-zinc-800 aria-selected:border-zinc-700">
                                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                                    <MousePointer2 className="h-5 w-5 text-rose-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-zinc-200">Buttons</p>
                                    <p className="text-xs text-zinc-500 line-clamp-1">Interactive elements</p>
                                </div>
                            </CommandItem>
                            <CommandItem onSelect={() => { }} className="cursor-pointer flex flex-col items-start gap-4 p-4 h-32 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all group aria-selected:bg-zinc-800 aria-selected:border-zinc-700">
                                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                                    <ImageIcon className="h-5 w-5 text-orange-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-zinc-200">Carousels</p>
                                    <p className="text-xs text-zinc-500 line-clamp-1">Image sliders</p>
                                </div>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-zinc-900 my-4" />

                        <div className="flex items-center justify-between px-2 py-2">
                            <div className="flex gap-2 text-xs text-zinc-500">
                                <span>Contact support</span>
                                <span>•</span>
                                <span>Share feedback</span>
                            </div>

                        </div>

                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}
