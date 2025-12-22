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
    Box
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

interface SearchPopupProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SearchPopup({ open, setOpen }: SearchPopupProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0 shadow-2xl bg-zinc-950 border-zinc-800 sm:rounded-xl max-w-lg">
                <DialogTitle className="sr-only">Search</DialogTitle>
                <Command className="bg-transparent text-white h-full w-full flex flex-col [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                    <CommandInput
                        placeholder="Search components..."
                        className="text-white placeholder:text-zinc-500 border-b border-zinc-800 bg-transparent selection:bg-zinc-800"
                    />
                    <CommandList className="max-h-[400px] overflow-y-auto p-2 scrollbar-none">
                        <CommandEmpty className="text-zinc-500 text-sm py-6 text-center">No results found.</CommandEmpty>

                        <CommandGroup heading="Components">
                            <CommandItem onSelect={() => console.log('Heroes clicked')} className="cursor-pointer text-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white hover:bg-zinc-900 rounded-md my-1 transition-colors">
                                <Layout className="mr-3 h-4 w-4 text-zinc-400" />
                                <span>Heroes</span>
                            </CommandItem>
                            <CommandItem onSelect={() => { }} className="cursor-pointer text-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white hover:bg-zinc-900 rounded-md my-1 transition-colors">
                                <Layers className="mr-3 h-4 w-4 text-zinc-400" />
                                <span>Backgrounds</span>
                            </CommandItem>
                            <CommandItem onSelect={() => { }} className="cursor-pointer text-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white hover:bg-zinc-900 rounded-md my-1 transition-colors">
                                <Box className="mr-3 h-4 w-4 text-zinc-400" />
                                <span>Features</span>
                            </CommandItem>
                            <CommandItem onSelect={() => { }} className="cursor-pointer text-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white hover:bg-zinc-900 rounded-md my-1 transition-colors">
                                <Smile className="mr-3 h-4 w-4 text-zinc-400" />
                                <span>Cards</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-zinc-900 my-2" />

                        <CommandGroup heading="Suggestions">
                            <CommandItem onSelect={() => { }} className="cursor-pointer text-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white hover:bg-zinc-900 rounded-md my-1 transition-colors">
                                <User className="mr-3 h-4 w-4 text-zinc-400" />
                                <span>Profile</span>
                                <CommandShortcut className="text-zinc-600">⌘P</CommandShortcut>
                            </CommandItem>
                            <CommandItem onSelect={() => { }} className="cursor-pointer text-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white hover:bg-zinc-900 rounded-md my-1 transition-colors">
                                <CreditCard className="mr-3 h-4 w-4 text-zinc-400" />
                                <span>Billing</span>
                                <CommandShortcut className="text-zinc-600">⌘B</CommandShortcut>
                            </CommandItem>
                            <CommandItem onSelect={() => { }} className="cursor-pointer text-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white hover:bg-zinc-900 rounded-md my-1 transition-colors">
                                <Settings className="mr-3 h-4 w-4 text-zinc-400" />
                                <span>Settings</span>
                                <CommandShortcut className="text-zinc-600">⌘S</CommandShortcut>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}
