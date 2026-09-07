'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, RefreshCw, Zap } from 'lucide-react';

interface AstronautRocket404Props {
    currentPath?: string;
}

export function AstronautRocket404({ currentPath = '/unknown-coordinate' }: AstronautRocket404Props) {
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [isPinging, setIsPinging] = useState(false);

    const distressMessages = [
        `"POSTPIPE HQ, WE HAVE A PROBLEM! Rocket crashed at: ${currentPath} -- Send warp coordinates!"`,
        `"CRITICAL SYSTEM ERROR! Engine thruster burnout on sector 404! Requesting immediate rescue drop!"`,
        `"MISSION FAILED! Telemetry lost in deep pixel space. Ready to respawn at Home base!"`,
        `"HOUSTON / HQ! Our pipeline packets clipped through the world boundary!"`
    ];

    const handlePing = () => {
        setIsPinging(true);
        setDialogueIndex((prev) => (prev + 1) % distressMessages.length);
        setTimeout(() => setIsPinging(false), 500);
    };

    return (
        <div className='relative w-full max-w-4xl mx-auto flex flex-col items-center select-none'>
            {/* Retro Game Dialog Box */}
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                onClick={handlePing}
                className='relative z-30 mb-4 sm:mb-6 cursor-pointer group max-w-xl w-full px-3'
                title='Press to cycle transmission'
            >
                <div className='relative p-3.5 sm:p-5 rounded-2xl bg-neutral-950/95 border-2 border-purple-500/70 backdrop-blur-xl shadow-[0_0_30px_rgba(157,78,221,0.35)] group-hover:border-purple-400 group-hover:shadow-[0_0_45px_rgba(157,78,221,0.55)] transition-all duration-200'>
                    {/* Retro Arcade Header Bar */}
                    <div className='flex items-center justify-between gap-2 pb-2 mb-2 border-b border-purple-900/60 font-mono text-[11px] sm:text-xs'>
                        <div className='flex items-center gap-2 font-bold tracking-wider text-purple-400 uppercase'>
                            <span className='relative flex h-2.5 w-2.5'>
                                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80'></span>
                                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500'></span>
                            </span>
                            <Radio className='w-3.5 h-3.5 text-pink-400 animate-pulse' />
                            <span>POSTPIPE HQ // COMMS LINK</span>
                        </div>
                        <span className='text-[10px] sm:text-[11px] text-neutral-400 font-mono flex items-center gap-1 group-hover:text-purple-300 transition-colors bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded'>
                            <RefreshCw className={`w-2.5 h-2.5 ${isPinging ? 'animate-spin text-pink-400' : ''}`} />
                            [CLICK TO PING]
                        </span>
                    </div>

                    {/* Dialogue Text with retro typing feel */}
                    <AnimatePresence mode='wait'>
                        <motion.p
                            key={dialogueIndex}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 4 }}
                            transition={{ duration: 0.15 }}
                            className='text-xs sm:text-sm font-mono text-purple-100 font-medium leading-relaxed tracking-wide text-left'
                        >
                            <span className='text-pink-400 mr-2 font-bold'>&gt;</span>
                            {distressMessages[dialogueIndex]}
                            <span className='inline-block w-2 h-3.5 bg-purple-400 ml-1.5 animate-pulse align-middle' />
                        </motion.p>
                    </AnimatePresence>

                    {/* Pointer down towards astronaut */}
                    <div className='absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-neutral-950 border-r-2 border-b-2 border-purple-500/70 transform rotate-45' />
                </div>
            </motion.div>

            {/* Retro Game Arcade Screen */}
            <div className='relative w-full aspect-[16/9] max-h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-purple-900/60 shadow-[0_0_60px_rgba(157,78,221,0.25)] bg-neutral-950 group'>
                {/* 16-Bit Pixel Art Game Scene */}
                <Image
                    src='/retro-astronaut-rocket-404.jpg'
                    alt='16-bit retro pixel game astronaut stranded with broken Postpipe rocket'
                    fill
                    priority
                    className='object-cover object-center pixelated scale-[1.01] transition-transform duration-500 group-hover:scale-[1.02]'
                />

                {/* CRT Scanline & Screen Glow Filter */}
                <div
                    className='absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay'
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)'
                    }}
                />

                {/* Soft Vignette Border */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none' />

                {/* ================= POSTPIPE BRANDING EMBLEM OVERLAY ON ROCKET ================= */}
                <div className='absolute top-[52%] left-[36%] -translate-x-1/2 -translate-y-1/2 pointer-events-none'>
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950/90 border border-purple-400/90 shadow-[0_0_15px_rgba(157,78,221,0.7)] backdrop-blur-md rotate-[-22deg]'
                    >
                        {/* Postpipe SVG Logo */}
                        <svg
                            viewBox='0 0 500 500'
                            className='w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                        >
                            <path
                                fillRule='evenodd'
                                fill='#ffffff'
                                d='m105 9l338.9 57.7c-292.3 108.5-331 394.6-331.6 429.2z'
                            />
                        </svg>
                        <span className='text-[9px] sm:text-[11px] font-black tracking-widest text-white uppercase font-mono'>
                            POSTPIPE
                        </span>
                    </motion.div>
                </div>

                {/* ================= ANIMATED RETRO RADIO TRANSMISSION RINGS ================= */}
                <div className='absolute top-[54%] left-[60.5%] sm:left-[60.8%] pointer-events-none'>
                    {/* Blinking Red Pixel Antenna Beacon */}
                    <div className='relative w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-ping' />
                    <motion.div
                        animate={{
                            scale: [1, 3.2],
                            opacity: [0.9, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                        className='absolute -top-3 -left-3 w-6 h-6 rounded-full border-2 border-pink-400 shadow-[0_0_10px_#ec4899]'
                    />
                    <motion.div
                        animate={{
                            scale: [1, 4],
                            opacity: [0.7, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                        className='absolute -top-3 -left-3 w-6 h-6 rounded-full border border-purple-400'
                    />
                </div>

                {/* ================= ANIMATED RETRO ENGINE SPARKS ================= */}
                <div className='absolute top-[28%] left-[54%] pointer-events-none'>
                    <motion.div
                        animate={{
                            opacity: [0, 1, 0, 0, 1, 0],
                            scale: [0.8, 1.4, 0.8],
                            rotate: [-15, 20, -15]
                        }}
                        transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                        className='absolute -top-4 -left-4 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,1)]'
                    >
                        <Zap className='w-5 h-5 sm:w-6 sm:h-6 fill-amber-300' />
                    </motion.div>
                    <motion.div
                        animate={{
                            opacity: [0, 0, 1, 0, 1, 0],
                            scale: [0.7, 1.3, 0.7]
                        }}
                        transition={{ repeat: Infinity, duration: 1.4, delay: 0.3 }}
                        className='absolute top-3 -left-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,1)]'
                    >
                        <Zap className='w-4 h-4 fill-cyan-300' />
                    </motion.div>
                </div>

                {/* ================= RETRO HUD OVERLAYS ================= */}
                {/* Top Left: Game Status */}
                <div className='absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-3 font-mono text-[10px] sm:text-xs text-neutral-300 bg-black/80 px-3 py-1.5 rounded-lg border border-neutral-800 backdrop-blur-md'>
                    <div className='flex items-center gap-1.5 text-red-400 font-bold'>
                        <span className='h-2 w-2 rounded-full bg-red-500 animate-pulse' />
                        <span>HP: 00/100</span>
                    </div>
                    <span className='text-neutral-600'>|</span>
                    <span className='text-purple-400 font-semibold'>STAGE: 404 - LOST ORBIT</span>
                </div>

                {/* Top Right: Score/Code */}
                <div className='absolute top-3 right-3 sm:top-4 sm:right-4 z-20 font-mono text-[10px] sm:text-xs text-amber-400 bg-black/80 px-3 py-1.5 rounded-lg border border-neutral-800 backdrop-blur-md hidden sm:block'>
                    SCORE: 000404
                </div>

                {/* Bottom Left: Mission Tag */}
                <div className='absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 border border-neutral-800/80 backdrop-blur-md text-[10px] sm:text-xs font-mono text-neutral-300'>
                    <span className='text-pink-400 font-bold'>[!] STATUS:</span>
                    <span>MISSION FAILED // AWAITING TELEPORT</span>
                </div>
            </div>
        </div>
    );
}
