import Link from "next/link";
import { Mail, Instagram, Github, Coffee } from "lucide-react";
import { AnimatedWords } from "../ui/animated-words";
import { WordRotate } from "@/components/ui/word-rotate";
import { CountrySelector } from "@/components/country-selector";

const productLinks = [
    { href: "/login", label: "Product" },
    { href: "https://kontext.postpipe.in", label: "Kontext" },
    { href: "/docs", label: "Docs" },
    { href: "/explore", label: "Dynamic" },
];

const resourceLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/static", label: "Static" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/sitemap", label: "Sitemap" },
];

const contactEmails = [
    { label: "Founder", email: "founder@postpipe.in" },
    { label: "Pinaki", email: "cant-reveal@postpipe.in" },
];

export function AppFooter() {
    return (
        <footer className="border-t bg-background overflow-hidden relative">
            <div className="w-full max-w-none px-4 md:px-12 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 md:mb-24">

                    {/* Brand + tagline */}
                    <div>
                        <h3 className="text-xl md:text-2xl font-medium mb-3">Experience the Backend</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Postpipe turns any database into a production-ready form backend — no server code required.
                        </p>
                    </div>

                    {/* Nav links */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-medium mb-4">Product</h4>
                            <ul className="space-y-3">
                                {productLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-4">Resources</h4>
                            <ul className="space-y-3">
                                {resourceLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contact / Connect */}
                    <div className="space-y-8">

                        {/* Contact */}
                        <div>
                            <h4 className="font-medium mb-4 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Get in Touch
                            </h4>
                            <p className="text-muted-foreground text-xs mb-3 leading-relaxed">
                                Questions, suggestions, or interested in joining the Postpipe team? Drop us a mail.
                            </p>
                            <ul className="space-y-2">
                                {contactEmails.map(({ label, email }) => (
                                    <li key={email}>
                                        <a
                                            href={`mailto:${email}`}
                                            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 w-14 shrink-0">{label}</span>
                                            <span className="group-hover:underline underline-offset-2">{email}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social + Community */}
                        <div>
                            <h4 className="font-medium mb-4">Community</h4>
                            <div className="flex flex-col gap-3">
                                <a
                                    href="https://www.instagram.com/postpipe.official"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 group-hover:bg-pink-500/10 group-hover:border-pink-500/30 transition-all">
                                        <Instagram className="h-4 w-4 group-hover:text-pink-400 transition-colors" />
                                    </span>
                                    <div>
                                        <p className="font-medium text-foreground/80 group-hover:text-foreground leading-none">@postpipe.official</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Follow us on Instagram</p>
                                    </div>
                                </a>

                                <a
                                    href="https://github.com/PostPipe/Postpipe-2.0-fontend"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                                        <Github className="h-4 w-4 transition-colors" />
                                    </span>
                                    <div>
                                        <p className="font-medium text-foreground/80 group-hover:text-foreground leading-none">Contribute on GitHub</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Open source · PRs welcome</p>
                                    </div>
                                </a>

                                <a
                                    href="https://buymeacoffee.com/sourodip"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 group-hover:bg-[#FFDD00]/10 group-hover:border-[#FFDD00]/30 transition-all">
                                        <Coffee className="h-4 w-4 group-hover:text-[#FFDD00] transition-colors" />
                                    </span>
                                    <div>
                                        <p className="font-medium text-foreground/80 group-hover:text-foreground leading-none">Support This Project</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Buy me a coffee</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rotating endpoint showcase */}
                <div className="mb-10 flex flex-col items-center justify-center">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground/40 mb-5 text-center font-mono">Route anything. Capture everything.</p>
                    <div className="flex items-baseline justify-center gap-0 font-mono">
                        <span className="text-2xl sm:text-3xl md:text-4xl text-muted-foreground/30 font-medium">postpipe.in/submissions/</span>
                        <WordRotate
                            className="text-2xl sm:text-3xl md:text-4xl text-foreground/80 font-bold"
                            words={["feedback", "waitlist", "contact", "newsletter", "surveys", "users"]}
                            duration={2000}
                        />
                    </div>
                </div>

                {/* Bottom divider + legal */}
                <div className="border-t border-border/50 pt-8 mb-16 md:mb-24 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <p className="text-xs text-muted-foreground/50">
                            © {new Date().getFullYear()} Postpipe. Built with ❤️ in India.
                        </p>
                        <CountrySelector />
                        <Link
                            href="/sitemap"
                            className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors underline-offset-4 hover:underline flex items-center gap-1"
                        >
                            <span>Sitemap</span>
                        </Link>
                    </div>
                    <p className="text-xs text-muted-foreground/40">
                        Maintained by Sourodip &amp; Pinaki
                    </p>
                </div>

                <div className="text-center w-full flex justify-center overflow-hidden">
                    <AnimatedWords
                        text="PostPipe"
                        className="font-headline text-[20vw] md:text-[22vw] lg:text-[24vw] font-bold tracking-tighter leading-none whitespace-nowrap"
                    />
                </div>
            </div>
        </footer>
    );
}
