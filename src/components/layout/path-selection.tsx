"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Terminal, ArrowRight, ShieldCheck, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Workflow Data
const staticSteps = [
  { id: "s1", title: "Design Your Forms", image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1788190389/postpipe_cwnwwj.gif" },
  { id: "s2", title: "Setup Connectors", image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1788190391/settings_p0ccrr.gif" },
  { id: "s3", title: "Test & Deploy", image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1788190391/testing_mistui.gif" },
];

const dynamicSteps = [
  { id: "d1", title: "CLI Setup", image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1788190392/forge1_xpdrot.gif" }, 
  { id: "d2", title: "Component Scaffold", image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1788190390/forge2_zbpbm3.gif" },
  { id: "d3", title: "Database Deploy", image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1788190389/forge3_uqlmvc.gif" },
];

export function PathSelection() {
  const [hoveredPath, setHoveredPath] = useState<"static" | "dynamic" | null>(null);

  // Desktop clip paths with a 2px gap
  const getClipPath = (panel: "static" | "dynamic", state: "static" | "dynamic" | null) => {
    if (panel === "static") {
      if (state === "static") return "polygon(0 0, calc(85% - 1px) 0, calc(75% - 1px) 100%, 0 100%)";
      if (state === "dynamic") return "polygon(0 0, calc(25% - 1px) 0, calc(15% - 1px) 100%, 0 100%)";
      return "polygon(0 0, calc(55% - 1px) 0, calc(45% - 1px) 100%, 0 100%)";
    } else {
      if (state === "static") return "polygon(calc(85% + 1px) 0, 100% 0, 100% 100%, calc(75% + 1px) 100%)";
      if (state === "dynamic") return "polygon(calc(25% + 1px) 0, 100% 0, 100% 100%, calc(15% + 1px) 100%)";
      return "polygon(calc(55% + 1px) 0, 100% 0, 100% 100%, calc(45% + 1px) 100%)";
    }
  };

  const transitionConfig = { type: "tween", duration: 0.4, ease: "easeInOut" };

  return (
    <section id="choose-path" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 mb-12">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Choose Your <span className="text-primary">Path</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're connecting an existing database or building a new backend from scratch, PostPipe has you covered.
          </p>
        </div>
      </div>

      {/* DESKTOP SPLIT SCREEN (> lg) */}
      <div className="hidden lg:block relative w-[calc(100%-4rem)] xl:w-[calc(100%-6rem)] h-[650px] max-w-[1400px] mx-auto bg-border overflow-hidden rounded-3xl border border-border/50 shadow-2xl group/container">
        
        {/* ─── STATIC PATH (LEFT) ─── */}
        <motion.div
          className="absolute inset-0 bg-[#0a0a0a] overflow-hidden flex cursor-default"
          animate={{ clipPath: getClipPath("static", hoveredPath) }}
          transition={transitionConfig}
          onMouseEnter={() => setHoveredPath("static")}
          onMouseLeave={() => setHoveredPath(null)}
        >
          {/* Background Glow */}
          <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />

          {/* Inner Content Wrapper - Centers based on expanded state */}
          <motion.div 
            className="relative h-full flex items-center shrink-0"
            animate={{ width: hoveredPath === "static" ? "80%" : "50%" }}
            transition={transitionConfig}
          >
            <div className="w-full flex px-16 h-full items-center">
                {/* Default Text Info */}
                <motion.div 
                    className="flex flex-col gap-6 w-[400px] shrink-0 z-10"
                    animate={{ 
                        opacity: hoveredPath === "dynamic" ? 0.3 : 1,
                        x: hoveredPath === "static" ? 0 : 40 
                    }}
                    transition={transitionConfig}
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2">
                    <Zap className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-3">Static (The Connector)</h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Connect your existing MongoDB or PostgreSQL database to PostPipe. Ideal for adding forms and data ingest to your current applications.
                    </p>
                  </div>
                  <ul className="space-y-3 mb-4">
                    {["Secure Signature Verification", "Zero-Trust Architecture", "Instant API Endpoints"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                        <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/static" className="w-fit">
                    <Button className="h-12 px-8 text-base font-bold gap-2 hover:gap-3 transition-all group/btn">
                      Get Started <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>

                {/* Expanded Reveal Content (GIFs) */}
                <AnimatePresence>
                  {hoveredPath === "static" && (
                    <motion.div 
                      className="flex-1 pl-16 pr-8 h-full flex flex-col justify-center gap-6 z-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ ...transitionConfig, delay: 0.1 }}
                    >
                        <h4 className="text-primary font-bold tracking-widest uppercase text-xs">How it Works</h4>
                        <div className="grid grid-cols-1 gap-6">
                            {staticSteps.map((step, idx) => (
                                <motion.div 
                                    key={step.id} 
                                    className="group flex items-center gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + (idx * 0.1) }}
                                >
                                    <div className="w-64 h-36 rounded-xl bg-black overflow-hidden relative shrink-0 border border-white/10 shadow-lg group-hover:border-primary/50 transition-colors">
                                        <Image src={step.image} alt={step.title} fill className="object-contain opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" unoptimized />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Step {idx + 1}</div>
                                        <div className="font-bold text-lg">{step.title}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* ─── DYNAMIC PATH (RIGHT) ─── */}
        <motion.div
          className="absolute inset-0 bg-[#0f0f13] overflow-hidden flex justify-end cursor-default"
          animate={{ clipPath: getClipPath("dynamic", hoveredPath) }}
          transition={transitionConfig}
          onMouseEnter={() => setHoveredPath("dynamic")}
          onMouseLeave={() => setHoveredPath(null)}
        >
           {/* Background Glow */}
           <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-violet-500/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />

          {/* Inner Content Wrapper */}
          <motion.div 
            className="relative h-full flex items-center justify-end shrink-0"
            animate={{ width: hoveredPath === "dynamic" ? "85%" : "55%" }}
            transition={transitionConfig}
          >
             <div className="w-full flex flex-row-reverse px-16 h-full items-center">
                {/* Default Text Info */}
                <motion.div 
                    className="flex flex-col gap-6 w-[400px] shrink-0 z-10"
                    animate={{ 
                        opacity: hoveredPath === "static" ? 0.3 : 1,
                        x: hoveredPath === "dynamic" ? 0 : -40
                    }}
                    transition={transitionConfig}
                >
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-2">
                    <Rocket className="h-8 w-8 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-3">Forge (CLI)</h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Scaffold full-featured Next.js backends with our CLI. perfect for new projects requiring auth, databases, and more.
                    </p>
                  </div>
                  <ul className="space-y-3 mb-4">
                    {["CLI-First Workflow", "Modular Components", "Ready-to-Deploy Templates"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                        <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Terminal className="h-3 w-3 text-emerald-500" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/explore" className="w-fit">
                    <Button variant="outline" className="h-12 px-8 text-base font-bold gap-2 hover:gap-3 transition-all group/btn bg-background/50 hover:bg-background">
                      Explore Forge <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>

                 {/* Expanded Reveal Content (GIFs) */}
                 <AnimatePresence>
                  {hoveredPath === "dynamic" && (
                    <motion.div 
                      className="flex-1 pr-16 pl-8 h-full flex flex-col justify-center gap-6 z-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ ...transitionConfig, delay: 0.1 }}
                    >
                        <h4 className="text-primary font-bold tracking-widest uppercase text-xs text-right">How it Works</h4>
                        <div className="grid grid-cols-1 gap-6">
                            {dynamicSteps.map((step, idx) => (
                                <motion.div 
                                    key={step.id} 
                                    className="group flex flex-row-reverse items-center gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors text-right"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + (idx * 0.1) }}
                                >
                                    <div className="w-64 h-36 rounded-xl bg-black overflow-hidden relative shrink-0 border border-white/10 shadow-lg group-hover:border-primary/50 transition-colors">
                                        <Image src={step.image} alt={step.title} fill className="object-contain opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" unoptimized />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Step {idx + 1}</div>
                                        <div className="font-bold text-lg">{step.title}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </motion.div>
        </motion.div>
      </div>

      {/* MOBILE STACKED CARDS (< lg) */}
      <div className="lg:hidden flex flex-col gap-6 px-4 w-full">
         {/* Static Card */}
         <div className="w-full rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="p-6 md:p-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                    <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Static (The Connector)</h3>
                <p className="text-muted-foreground mb-6">
                    Connect your existing MongoDB or PostgreSQL database to PostPipe.
                </p>
                <ul className="space-y-3 mb-8">
                    {["Secure Signature", "Zero-Trust", "Instant API"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                </ul>
                <Link href="/static">
                    <Button className="w-full h-12 text-lg font-bold gap-2">
                        Get Started <ArrowRight className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
            
            <div className="bg-white/[0.02] border-t border-border/50 p-6">
                <h4 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Workflow</h4>
                <div className="flex flex-col gap-4">
                    {staticSteps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-4">
                            <div className="w-24 h-14 rounded-md bg-black overflow-hidden relative shrink-0 border border-white/10">
                                <Image src={step.image} alt={step.title} fill className="object-contain opacity-90" unoptimized />
                            </div>
                            <div>
                                <div className="text-[10px] text-muted-foreground">Step {idx + 1}</div>
                                <div className="font-bold text-sm">{step.title}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>

         {/* Dynamic Card */}
         <div className="w-full rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="p-6 md:p-8">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6">
                    <Rocket className="h-8 w-8 text-violet-500" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Forge (CLI)</h3>
                <p className="text-muted-foreground mb-6">
                    Scaffold full-featured Next.js backends with our CLI.
                </p>
                <ul className="space-y-3 mb-8">
                    {["CLI-First", "Modular Components", "Deploy Templates"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                        <Terminal className="h-4 w-4 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                </ul>
                <Link href="/explore">
                    <Button variant="outline" className="w-full h-12 text-lg font-bold gap-2">
                        Explore Forge <ArrowRight className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
            
            <div className="bg-white/[0.02] border-t border-border/50 p-6">
                <h4 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Workflow</h4>
                <div className="flex flex-col gap-4">
                    {dynamicSteps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-4">
                            <div className="w-24 h-14 rounded-md bg-black overflow-hidden relative shrink-0 border border-white/10">
                                <Image src={step.image} alt={step.title} fill className="object-contain opacity-90" unoptimized />
                            </div>
                            <div>
                                <div className="text-[10px] text-muted-foreground">Step {idx + 1}</div>
                                <div className="font-bold text-sm">{step.title}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </div>
    </section>
  );
}
