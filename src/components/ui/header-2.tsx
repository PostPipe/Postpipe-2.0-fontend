'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useScroll } from '@/hooks/use-scroll';
import Link from 'next/link';
import { AuthButton } from '../layout/auth-button';
import { Logo } from '../icons/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';


export function Header2() {
	const scrolled = useScroll(10);

	const links = [
		{ href: "/dashboard/forms", label: "Forms" },
		{ href: "/dashboard/workflows", label: "Workflows" },
		{ href: "#pricing", label: "Pricing" },
		{ href: "#docs", label: "Docs" },
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
					scrolled && "h-14 max-w-5xl rounded-lg border bg-background/95 shadow-md backdrop-blur-lg supports-[backdrop-filter]:bg-background/50"
				)}
			>
					<Link href="/" className="flex items-center gap-2">
						<Logo className="size-6 text-primary" />
						<span className="font-bold font-headline">PostPipe Pro</span>
					</Link>
					<div className="hidden items-center gap-4 md:flex">
						{links.map((link, i) => (
							<Link key={i} className="animated-underline text-sm font-medium px-2 py-1" href={link.href}>
								{link.label}
							</Link>
						))}
						<AuthButton />
						<ThemeToggle />
					</div>
			</div>
		</header>
	);
}
