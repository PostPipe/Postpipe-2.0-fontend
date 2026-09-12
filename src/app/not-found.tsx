'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowRight, Gamepad2 } from 'lucide-react';
import { Particles } from '@/components/ui/particles';
import { ShinyText } from '@/components/ui/shiny-text';
import { AstronautRocket404 } from '@/components/ui/astronaut-rocket-404';

export default function NotFound() {
    const [pathName, setPathName] = useState<string>('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPathName(window.location.pathname);
        }
    }, []);

    return (
        <div className='relative min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center overflow-hidden bg-black px-4 py-10 selection:bg-purple-500/30'>
            {/* Background Atmosphere */}
            <div className='absolute inset-0 pointer-events-none'>
                <Particles
                    className='absolute inset-0'
                    quantity={80}
                    staticity={35}
                    ease={50}
                    color='#C77DFF'
                />
                <div className='absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none' />
                <div className='absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[130px] pointer-events-none' />
            </div>

            <div className='relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center'>
                {/* Retro Arcade Status Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-purple-500/40 text-neutral-300 text-xs font-mono mb-4 backdrop-blur-md shadow-lg shadow-purple-950/40'
                >
                    <span className='relative flex h-2 w-2'>
                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'></span>
                        <span className='relative inline-flex rounded-full h-2 w-2 bg-amber-500'></span>
                    </span>
                    <Gamepad2 className='w-3.5 h-3.5 text-purple-400' />
                    <span className='text-purple-300 font-bold'>ERROR 404</span>
                    <span className='text-neutral-600'>|</span>
                    <span className='text-neutral-300'>STAGE FAILED: UNCHARTED ORBIT</span>
                </motion.div>

                {/* Retro Pixel Art Astronaut & Rocket Game Scene */}
                <AstronautRocket404 currentPath={pathName || '/undefined-route'} />

                {/* Main 404 Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className='text-3xl sm:text-5xl md:text-6xl font-black tracking-tight font-space text-white mt-4 mb-2'
                >
                    <ShinyText speed={4} className='bg-gradient-to-r from-neutral-100 via-purple-300 to-pink-400'>
                        Game Over: Route Lost
                    </ShinyText>
                </motion.h1>

                {/* Subtitle Message */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className='text-neutral-400 text-xs sm:text-sm md:text-base max-w-lg mb-8 font-normal leading-relaxed'
                >
                    Our Postpipe rocket took critical engine damage on this route. Let&apos;s beam our astronaut back to safety.
                </motion.p>

                {/* Only One CTA: Return to Home */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className='flex items-center justify-center w-full'
                >
                    <Link
                        href='/'
                        className='group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-white text-black font-semibold text-sm sm:text-base hover:bg-neutral-100 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(157,78,221,0.5)] active:scale-[0.98]'
                    >
                        <Home className='h-4 w-4 transition-transform group-hover:-translate-y-0.5' />
                        <span>Return to Home</span>
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1 text-purple-600' />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
