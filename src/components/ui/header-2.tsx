'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useScroll } from '@/hooks/use-scroll';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { AuthButton } from '../layout/auth-button';


import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, HelpCircle, ChevronRight } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

export function Header2() {
	const scrolled = useScroll(10);
	const pathname = usePathname();
	const [isOpen, setIsOpen] = React.useState(false);

	const links = [
		{ href: "/static", label: "Static" },
		{ href: "https://kontext.postpipe.in", label: "Kontext" },
		{ href: "/explore", label: "Forge" },
		{ href: "/dashboard/changelog", label: "Change Log" },
		{ href: "/docs", label: "Docs" },
		{ href: "/pricing", label: "Pricing" },
	];

	return (
		<header
			className={cn(
				'sticky top-0 z-50 w-full transition-all ease-out',
				scrolled && "md:top-4"
			)}
		>
			<div
				className={cn(
					"mx-auto flex h-16 max-w-full items-center justify-between border-b bg-background px-4 transition-all duration-300 ease-out",
					scrolled && "h-14 max-w-5xl rounded-lg border bg-background/95 shadow-md backdrop-blur-sm supports-[backdrop-filter]:bg-background/60"
				)}
			>
				<Link href="/" className="flex items-center gap-2">
					<div className="relative h-8 w-40">
						<Image src="/PostPipe-Black.svg" alt="PostPipe" fill sizes="160px" className="dark:hidden object-contain object-left" />
						<Image src="/PostPipe.svg" alt="PostPipe" fill sizes="160px" className="hidden dark:block object-contain object-left" />
					</div>
				</Link>
				<div className="hidden items-center gap-2 md:flex">
					{links.map((link, i) => (
						<Link key={i} className="animated-underline text-sm font-medium px-2 py-1" href={link.href}>
							{link.label}
						</Link>
					))}
					<div className="flex items-center gap-3 ml-2 border-l pl-4 border-border/50">
						<AuthButton />
						{pathname === '/dashboard' && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => document.dispatchEvent(new CustomEvent('replay-tour'))}
											className="h-9 w-9 text-muted-foreground hover:text-foreground hover:!bg-transparent group"
										>
											<HelpCircle className="h-5 w-5 transition-all duration-300 group-hover:text-primary group-hover:drop-shadow-[0_0_8px_hsl(var(--primary))]" />
											<span className="sr-only">Replay Tour</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Replay Tour</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2 md:hidden">
					{pathname === '/dashboard' && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => document.dispatchEvent(new CustomEvent('replay-tour'))}
							className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:!bg-transparent group"
							title="Replay Tour"
						>
							<HelpCircle className="h-5 w-5 transition-all duration-300 group-hover:text-primary group-hover:drop-shadow-[0_0_8px_hsl(var(--primary))]" />
						</Button>
					)}
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="shrink-0">
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[85vw] sm:w-[400px] border-l border-border/50 bg-background/95 backdrop-blur-xl p-0">
							<div className="flex flex-col h-full">
								<div className="p-6 pb-4 border-b border-border/50">
									<SheetHeader>
										<SheetTitle className="text-left text-2xl font-bold tracking-tight">Navigation</SheetTitle>
										<SheetDescription className="sr-only">
											Navigation links for PostPipe.
										</SheetDescription>
									</SheetHeader>
								</div>
								
								<div className="flex-1 overflow-y-auto py-4 px-3">
									<div className="flex flex-col gap-1">
										{links.map((link, i) => (
											<Link
												key={i}
												href={link.href}
												onClick={() => setIsOpen(false)}
												className="group flex items-center justify-between rounded-xl px-4 py-4 text-base font-medium transition-all hover:bg-muted/50 active:scale-[0.98]"
											>
												<span className="text-muted-foreground group-hover:text-foreground transition-colors">{link.label}</span>
												<ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
											</Link>
										))}
									</div>
								</div>

								<div className="p-6 pb-32 border-t border-border/50 bg-muted/20">
									<div className="flex flex-col gap-4">
										<p className="text-xs uppercase tracking-widest text-muted-foreground/50 font-mono font-semibold">Account</p>
										<div className="w-full">
											<AuthButton className="w-full justify-center" onClick={() => setIsOpen(false)} />
										</div>
									</div>
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
