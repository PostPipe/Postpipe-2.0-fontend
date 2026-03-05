"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ParticleDashboardHeaderProps {
    title: string;
    subtitle: string;
    className?: string;
}

export function ParticleDashboardHeader({ title, subtitle, className }: ParticleDashboardHeaderProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const hoverRef = useRef(false);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let textCoordinates: { x: number; y: number }[] = [];

        const resizeCanvas = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            initParticles();
        };

        class Particle {
            x: number;
            y: number;
            textX: number;
            textY: number;
            bgX: number;
            bgY: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            opacity: number;
            opacitySpeed: number;
            isTextParticle: boolean;
            bgColorSkipFlag: boolean;

            constructor(textX: number, textY: number, color: string, isTextParticle: boolean) {
                this.bgX = Math.random() * canvas!.width;
                this.bgY = Math.random() * canvas!.height;
                this.x = this.bgX;
                this.y = this.bgY;
                this.textX = textX;
                this.textY = textY;
                this.isTextParticle = isTextParticle;

                // Hide ~85% of text particles when unhovered to keep background clean
                this.bgColorSkipFlag = Math.random() > 0.15;

                // Slow consistent drift velocity instead of random jitter
                this.vx = (Math.random() - 0.5) * 0.03;
                this.vy = (Math.random() - 0.5) * 0.03;

                // Crisp integer sizes for sharper stars
                this.size = Math.random() > 0.8 ? 2 : 1;
                this.color = color;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.opacitySpeed = (Math.random() * 0.01) + 0.005;
            }

            draw(isHovered: boolean) {
                if (!ctx) return;

                // When NOT hovered, drastically reduce the number of text particles visible
                // by skipping the draw call for the vast majority of them.
                if (this.isTextParticle && !isHovered && this.bgColorSkipFlag) {
                    return;
                }

                this.opacity += this.opacitySpeed;
                if (this.opacity >= 0.8 || this.opacity <= 0.1) {
                    this.opacitySpeed = -this.opacitySpeed;
                }

                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();

                ctx.globalAlpha = 1;
            }

            update(isHovered: boolean) {
                const targetX = (isHovered && this.isTextParticle) ? this.textX : this.bgX;
                const targetY = (isHovered && this.isTextParticle) ? this.textY : this.bgY;

                const dx = targetX - this.x;
                const dy = targetY - this.y;

                // Add a very subtle continuous drift for background stars so space feels alive
                if (!isHovered) {
                    this.bgX += this.vx;
                    this.bgY += this.vy;

                    // keep them in canvas
                    if (this.bgX < 0) this.bgX = canvas!.width;
                    if (this.bgX > canvas!.width) this.bgX = 0;
                    if (this.bgY < 0) this.bgY = canvas!.height;
                    if (this.bgY > canvas!.height) this.bgY = 0;
                }

                // Smooth easing physics back to base positions
                this.x += dx * 0.08;
                this.y += dy * 0.08;
            }
        }

        const initParticles = () => {
            if (!ctx || !canvas) return;
            particles = [];
            textCoordinates = [];

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let fontSize = Math.min(canvas.width / 5, 120);
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;

            // Downscale font size if text is too wide for the container
            const padding = 40;
            let textWidth = ctx.measureText(title).width;
            if (textWidth > canvas.width - padding * 2) {
                fontSize = fontSize * ((canvas.width - padding * 2) / textWidth);
                ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            }

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Draw text to center
            ctx.fillText(title, canvas.width / 2, canvas.height / 2);

            const textData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isDarkMode = resolvedTheme === 'dark';
            const particleColor = isDarkMode ? '#ffffff' : '#000000'; // Pure white or black for stars

            // Scan for non-transparent pixels (sampling to reduce particle count)
            // Increased the step significantly to reduce text particle density
            const step = canvas.width < 768 ? 10 : 8;

            for (let y = 0; y < textData.height; y += step) {
                for (let x = 0; x < textData.width; x += step) {
                    const index = (y * textData.width + x) * 4;
                    const alpha = textData.data[index + 3];
                    if (alpha > 128) {
                        // text particles
                        particles.push(new Particle(x, y, particleColor, true));
                    }
                }
            }

            // Fill particles to make it look like an open universe
            // Reduced from 100 to 30 to make the background much cleaner
            for (let i = 0; i < 30; i++) {
                particles.push(new Particle(0, 0, particleColor, false));
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].draw(hoverRef.current);
                particles[i].update(hoverRef.current);
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        animate();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [title, mounted, resolvedTheme]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative flex min-h-[250px] w-full flex-col justify-center overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 shadow-sm group cursor-pointer mb-8",
                className
            )}
            onMouseEnter={() => {
                setIsHovered(true);
                hoverRef.current = true;
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                hoverRef.current = false;
            }}
        >
            {/* The particles will render here */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 h-full w-full"
            />

            {/* Cosmos background gradient */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.25)_0%,transparent_70%)] pointer-events-none transition-opacity duration-1000 ease-in-out"></div>

            {/* We fade out the standard HTML title when hovered, because particles take over! */}
            <div className={cn(
                "relative z-20 p-8 flex flex-col items-start gap-3 h-full justify-center pointer-events-none transition-opacity duration-700 max-w-3xl",
                isHovered ? "opacity-0" : "opacity-100"
            )}>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-neutral-900 dark:text-white drop-shadow-sm">
                    {title}
                    <span className="text-primary">.</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}
