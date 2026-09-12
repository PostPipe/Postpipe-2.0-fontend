"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    id: "step-1",
    step: "Step 01",
    title: "Design Your Forms",
    description:
      "Visually build and configure your static forms. Add fields, validation, and custom layouts — no boilerplate code required.",
    image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1788190389/postpipe_cwnwwj.gif",
  },
  {
    id: "step-2",
    step: "Step 02",
    title: "Setup Connectors",
    description:
      "Securely route submissions to any backend. Connect to databases, webhooks, and third-party APIs in just a few clicks.",
    image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1788190391/settings_p0ccrr.gif",
  },
  {
    id: "step-3",
    step: "Step 03",
    title: "Test & Deploy",
    description:
      "Test your endpoints directly within PostPipe. Once verified, deploy instantly and generate embeddable snippets for anywhere.",
    image: "https://res.cloudinary.com/dbaw86kzf/image/upload/v1788190391/testing_mistui.gif",
  },
];

const textVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -28 },
};

const gifVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.03 },
};

const transition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const };

export function WorkflowScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    // Use gsap.context for proper cleanup
    const ctx = gsap.context(() => {
      // 1. Counter-translate the pinned element to perfectly match the smooth scroller lag
      // This eliminates the "bouncing/jitter" caused by native pinning inside a scrubbed wrapper.
      const pinDistance = (steps.length - 1) * window.innerHeight;
      
      const pinAnim = gsap.to(pin, {
        y: pinDistance,
        ease: "none"
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${pinDistance}`,
        animation: pinAnim,
        scrub: true, // true syncs perfectly with Lenis to prevent desync/jitter
        onUpdate: (self) => {
          const newIndex = Math.min(
            steps.length - 1,
            Math.floor(self.progress * steps.length)
          );
          setActiveIndex((prev) => (prev !== newIndex ? newIndex : prev));
          
          // Update timeline progress bar height
          gsap.to(".timeline-progress-bar", {
            height: `${self.progress * 100}%`,
            ease: "none",
            duration: 0
          });
        },
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    // The outer section provides the total scroll track.
    // We manually set its height to accommodate the scroll distance.
    <section
      ref={sectionRef}
      className="relative w-full bg-background"
      style={{ minHeight: `${steps.length * 100}vh` }}
    >
      {/* This inner div is counter-translated to act as a pin */}
      <div
        ref={pinRef}
        className="w-full h-screen flex flex-col justify-center px-4 md:px-8 relative"
      >
        <div className="w-full max-w-7xl mx-auto flex">
          
          {/* Vertical Timeline Indicator */}
          <div className="hidden md:flex flex-col items-center mr-8 lg:mr-16 py-12 relative w-4">
             {/* Timeline Track */}
             <div className="absolute top-12 bottom-12 w-0.5 bg-border/50 rounded-full overflow-hidden">
                {/* Timeline Progress */}
                <div className="timeline-progress-bar w-full bg-primary rounded-full" style={{ height: "0%" }} />
             </div>
             
             {/* Step Nodes */}
             <div className="absolute top-12 bottom-12 flex flex-col justify-between items-center w-full">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 z-10 bg-background ${
                      activeIndex >= i ? "border-primary bg-primary" : "border-border/50"
                    }`} 
                  />
                ))}
             </div>
          </div>

          <div className="flex-1 w-full">
            {/* Header */}
            <div className="text-left md:text-center mb-10 md:mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                How It Works
              </p>
              <h2 className="text-3xl md:text-5xl font-bold font-headline text-foreground">
                From Idea to Live in Minutes
              </h2>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

              {/* ── Left: Text ── */}
              <div className="min-h-[220px] flex items-center relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={steps[activeIndex].id}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={transition}
                    className="w-full"
                  >
                    <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary mb-5">
                      {steps[activeIndex].step}
                    </span>

                    <h3 className="text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight font-headline text-foreground mb-4 leading-tight">
                      {steps[activeIndex].title}
                    </h3>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
                      {steps[activeIndex].description}
                    </p>

                    {/* Mobile Dot indicators (hidden on desktop since we have the vertical timeline) */}
                    <div className="flex md:hidden items-center gap-2 mt-8">
                      {steps.map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: i === activeIndex ? "2rem" : "0.4rem",
                            backgroundColor:
                              i === activeIndex
                                ? "hsl(var(--primary))"
                                : "hsl(var(--muted-foreground) / 0.3)",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Right: GIF ── */}
              <div
                className="relative w-full rounded-2xl border border-border/50 bg-muted/10 overflow-hidden shadow-2xl"
                style={{ height: "min(60vh, 480px)" }}
              >
                {/* Gradient overlay — purely decorative */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none z-10" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={steps[activeIndex].id + "-gif"}
                    variants={gifVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={transition}
                    className="absolute inset-0 flex items-center justify-center p-2"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={steps[activeIndex].image}
                        alt={steps[activeIndex].title}
                        fill
                        className="object-contain object-center"
                        unoptimized
                        priority
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Bottom label */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background/70 via-background/20 to-transparent px-5 pt-8 pb-3 pointer-events-none">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    {steps[activeIndex].step} · {steps[activeIndex].title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
