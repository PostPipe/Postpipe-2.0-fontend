import Link from "next/link";
import { Mail, Instagram, Github } from "lucide-react";
import { AnimatedWords } from "../ui/animated-words";

const productLinks = [
    { href: "/login", label: "Product" },
    { href: "/docs", label: "Docs" },
    { href: "/explore", label: "Dynamic" },
];

const resourceLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/static", label: "Static" },
    { href: "/dashboard", label: "Dashboard" },
];

const contactEmails = [
    { label: "Founder", email: "founder@postpipe.in" },
    { label: "Souvik", email: "souvik.dev@postpipe.in" },
    { label: "Soyam", email: "soyam.dev@postpipe.in" },
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
                                    href="https://github.com/Sourodip-1/Postpipe-2.0-fontend"
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom divider + legal */}
                <div className="border-t border-border/50 pt-8 mb-16 md:mb-24 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground/50">
                        © {new Date().getFullYear()} Postpipe. Built with ❤️ in India.
                    </p>
                    <p className="text-xs text-muted-foreground/40">
                        Made by Sourodip, Souvik &amp; Soyam
                    </p>
                </div>

                <div className="text-center">
                    <AnimatedWords
                        text="PostPiPe"
                        className="font-headline text-[11vw] md:text-[12rem] lg:text-[15rem] font-bold tracking-tighter leading-none whitespace-nowrap overflow-visible"
                    />
                </div>
            </div>
        </footer>
    );
}
