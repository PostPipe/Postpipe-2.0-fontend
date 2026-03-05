import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface IsoLevelWarpProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Primary line color as RGB values e.g. "14, 165, 233". Default: sky-500 */
    color?: string;
    /** Animation speed multiplier. Default: 1 */
    speed?: number;
    /** Grid density — lower = larger cells. Default: 40 */
    density?: number;
}

const IsoLevelWarp = ({
    className,
    color = "14, 165, 233",
    speed = 1,
    density = 40,
    ...props
}: IsoLevelWarpProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = container.offsetWidth;
        let height = container.offsetHeight;
        let animationFrameId: number;

        const gridGap = density;
        const rows = Math.ceil(height / gridGap) + 5;
        const cols = Math.ceil(width / gridGap) + 5;

        const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
        let time = 0;

        const resize = () => {
            width = container.offsetWidth;
            height = container.offsetHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.targetX = e.clientX - rect.left;
            mouse.targetY = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.targetX = -1000;
            mouse.targetY = -1000;
        };

        const smoothMix = (a: number, b: number, t: number) => a + (b - a) * t;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            mouse.x = smoothMix(mouse.x, mouse.targetX, 0.1);
            mouse.y = smoothMix(mouse.y, mouse.targetY, 0.1);

            time += 0.01 * speed;

            ctx.beginPath();

            for (let y = 0; y <= rows; y++) {
                let isFirst = true;
                for (let x = 0; x <= cols; x++) {
                    const baseX = x * gridGap - gridGap * 2;
                    const baseY = y * gridGap - gridGap * 2;

                    const wave = Math.sin(x * 0.2 + time) * Math.cos(y * 0.2 + time) * 15;

                    const dx = baseX - mouse.x;
                    const dy = baseY - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 300;
                    const force = Math.max(0, (maxDist - dist) / maxDist);
                    const interactionY = -(force * force) * 80;

                    const finalX = baseX;
                    const finalY = baseY + wave + interactionY;

                    if (isFirst) {
                        ctx.moveTo(finalX, finalY);
                        isFirst = false;
                    } else {
                        ctx.lineTo(finalX, finalY);
                    }
                }
            }

            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, `rgba(${color}, 0)`);
            gradient.addColorStop(0.5, `rgba(${color}, 0.5)`);
            gradient.addColorStop(1, `rgba(${color}, 0)`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener("resize", resize);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        resize();
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, speed, density]);

    return (
        <div
            ref={containerRef}
            className={cn("absolute inset-0 z-0 overflow-hidden", className)}
            {...props}
        >
            <canvas ref={canvasRef} className="block w-full h-full" />
            {/* Vignette for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
        </div>
    );
};

export default IsoLevelWarp;
