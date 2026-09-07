"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AppFooter } from "./app-footer";

import { usePathname } from "next/navigation";

export function AnimatedFooter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <AppFooter />
    </motion.div>
  );
}
