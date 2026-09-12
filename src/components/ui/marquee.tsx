"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  repeat?: number
  duration?: number
  fontSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
  strokeWidth?: string
}

const fontSizeClasses = {
  sm: "text-5xl sm:text-6xl md:text-7xl",
  md: "text-6xl sm:text-7xl md:text-8xl",
  lg: "text-7xl sm:text-8xl md:text-9xl",
  xl: "text-8xl sm:text-9xl md:text-[10rem]",
  "2xl": "text-9xl sm:text-[10rem] md:text-[11rem]",
  "3xl": "text-[10rem] sm:text-[11rem] md:text-[12rem]",
}

export const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  ({
    className,
    text,
    repeat = 4,
    duration = 20,
    fontSize = "lg",
    strokeWidth = "1px",
    ...props
  }, ref) => {
    const { theme } = useTheme()
    const isDark = theme === "dark" || !theme // Default to dark for this SaaS project

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-screen overflow-hidden py-16",
          className
        )}
        {...props}
      >
        <>
          <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        </>
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ 
            x: ["0%", "-50%"]
          }}
          transition={{ 
            repeat: Number.POSITIVE_INFINITY, 
            ease: "linear", 
            duration,
          }}
        >
          {[...Array(repeat)].map((_, index) => (
            <div key={index} className="flex items-center mx-4 select-none">
              <span
                className={cn(
                  fontSizeClasses[fontSize],
                  "font-black text-transparent px-4 uppercase tracking-tighter"
                )}
                style={{
                  WebkitTextStroke: `${strokeWidth} ${isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgb(156 163 175)'}`,
                }}
              >
                {text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    )
  }
)

Marquee.displayName = "Marquee"
