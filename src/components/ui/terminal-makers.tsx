"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function TerminalMakers() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const sequence = async () => {
            await new Promise(r => setTimeout(r, 800));
            setStep(1); // Start typing command
            await new Promise(r => setTimeout(r, 1200)); // Command typed
            setStep(2); // Show result
        };

        // Setup intersection observer to only animate when visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                sequence();
                observer.disconnect();
            }
        });

        const el = document.getElementById("terminal-makers-id");
        if (el) observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style>{`
                @keyframes scanlines {
                    from { background-position: 0 0; }
                    to { background-position: 0 4px; }
                }
                .scanline-overlay {
                    background-image: repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px);
                    animation: scanlines 1.5s linear infinite;
                }
            `}</style>
            <div id="terminal-makers-id" className="relative w-full max-w-4xl mx-auto rounded-xl border border-white/10 bg-[#050505] shadow-2xl overflow-hidden flex flex-col font-mono mt-8">
            {/* Terminal Header */}
            <div className="flex items-center px-4 py-2 border-b border-white/10 bg-white/[0.03]">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 text-xs text-white/40 font-mono">bash — ./makers.sh</div>
            </div>

            {/* Terminal Content */}
            <div className="p-5 sm:p-8 text-sm text-green-400 space-y-6 min-h-[400px]">
                {/* Typing Line */}
                <div className="flex items-center text-sm sm:text-base">
                    <span className="text-blue-400 mr-3">root@postpipe:~#</span>
                    <span className={cn(
                        "text-white inline-block overflow-hidden whitespace-nowrap border-r-[8px] border-white/80",
                        step === 0 ? "w-0 animate-pulse" : "",
                        step === 1 ? "w-[11ch]" : "border-transparent animate-none" // Hide cursor when done
                    )}
                        style={{
                            transition: step === 1 ? "width 1s steps(11, end)" : "none",
                        }}
                    >
                        {step >= 1 ? "./makers.sh" : ""}
                    </span>
                    {step >= 2 && <span className="inline-block w-2.5 h-5 bg-white/80 ml-2 animate-pulse" />}
                </div>

                {/* Output */}
                {step >= 2 && (
                    <div className="text-white/80 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <pre className="text-primary leading-tight mb-8 text-xs sm:text-sm">
                            {`> Fetching founder profiles...
> Compiling ASCII matrices...
[==================================>] 100% OK.`}
                        </pre>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-4">
                            {/* Sourodip */}
                            <a href="https://github.com/Sourodip-1" target="_blank" rel="noopener noreferrer" className="flex gap-4 sm:gap-6 items-start group hover:bg-white/[0.04] p-3 -m-3 rounded-xl transition-all cursor-pointer">
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 border border-white/20 bg-black overflow-hidden rounded-md group-hover:border-primary/50 transition-colors shadow-[0_0_15px_rgba(252,120,25,0)] group-hover:shadow-[0_0_15px_rgba(252,120,25,0.2)]">
                                    <img
                                        src="https://github.com/Sourodip-1.png"
                                        alt="Sourodip"
                                        className="w-full h-full object-cover grayscale contrast-125 transition-all duration-500 group-hover:grayscale-0 group-hover:contrast-100"
                                        style={{
                                            imageRendering: "pixelated"
                                        }}
                                    />
                                    <div className="absolute inset-0 scanline-overlay pointer-events-none" />
                                </div>
                                <div>
                                    <h4 className="text-primary font-bold text-xl sm:text-2xl mb-1 tracking-tight group-hover:underline underline-offset-4">Sourodip</h4>
                                    <p className="text-white/50 text-xs sm:text-sm font-medium">@Sourodip-1</p>
                                    <p className="text-white/70 text-xs sm:text-sm mt-3 leading-relaxed">Founder & Lead Engineer</p>
                                    <p className="text-white/40 text-[10px] sm:text-xs mt-2 uppercase tracking-widest">&gt; SYSTEM_ARCHITECT</p>
                                </div>
                            </a>

                            {/* Pinaki */}
                            <a href="https://github.com/PINaKey" target="_blank" rel="noopener noreferrer" className="flex gap-4 sm:gap-6 items-start group hover:bg-white/[0.04] p-3 -m-3 rounded-xl transition-all cursor-pointer">
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 border border-white/20 bg-black overflow-hidden rounded-md group-hover:border-primary/50 transition-colors shadow-[0_0_15px_rgba(252,120,25,0)] group-hover:shadow-[0_0_15px_rgba(252,120,25,0.2)]">
                                    <img
                                        src="https://github.com/PINaKey.png"
                                        alt="Pinaki"
                                        className="w-full h-full object-cover grayscale contrast-125 transition-all duration-500 group-hover:grayscale-0 group-hover:contrast-100"
                                        style={{
                                            imageRendering: "pixelated"
                                        }}
                                    />
                                    <div className="absolute inset-0 scanline-overlay pointer-events-none" />
                                </div>
                                <div>
                                    <h4 className="text-primary font-bold text-xl sm:text-2xl mb-1 tracking-tight group-hover:underline underline-offset-4">Pinaki</h4>
                                    <p className="text-white/50 text-xs sm:text-sm font-medium">@PINaKey</p>
                                    <p className="text-white/70 text-xs sm:text-sm mt-3 leading-relaxed">Co-Maintainer & Architect</p>
                                    <p className="text-white/40 text-[10px] sm:text-xs mt-2 uppercase tracking-widest">&gt; CORE_CONTRIBUTOR</p>
                                </div>
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Decorative Gradient Blob */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        </div>
        </>
    );
}
