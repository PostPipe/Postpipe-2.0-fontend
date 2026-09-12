"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShinyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

export function ShinyText({
    children,
    disabled = false,
    speed = 5,
    className = "",
    ...props
}: ShinyTextProps) {
    const animationDuration = `${speed}s`;

    return (
        <span
            className={cn(
                "inline-block bg-clip-text text-transparent",
                disabled
                    ? "text-neutral-500"
                    : "bg-gradient-to-r from-neutral-800 via-neutral-200 to-neutral-800 dark:from-neutral-400 dark:via-white dark:to-neutral-400 bg-[length:200%_100%] animate-shimmer",
                className
            )}
            style={{
                animationDuration: disabled ? undefined : animationDuration,
            }}
            {...props}
        >
            {children}
        </span>
    );
}
