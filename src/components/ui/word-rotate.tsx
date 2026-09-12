"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface WordRotateProps {
  words: string[];
  duration?: number;
  framerProps?: HTMLMotionProps<"span">;
  className?: string;
}

export function WordRotate({
  words,
  duration = 2500,
  framerProps = {
    initial: { opacity: 0, rotateX: -90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  className,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [words, duration]);

  // Find the longest word to set static dimensions and prevent layout shifts
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), "");

  return (
    <div className="relative inline-flex overflow-hidden" style={{ perspective: '100px' }}>
      {/* Invisible element to force container width and height */}
      <span className={cn("invisible pointer-events-none", className)}>
        {longestWord}
      </span>
      <div className="absolute inset-0 flex items-center justify-start">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            className={cn("inline-block text-left", className)}
            {...framerProps}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
