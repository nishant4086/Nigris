"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  compact?: boolean;
};

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = true,
  compact = false,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
      className={`glass-card w-full min-w-0 ${compact ? "p-4" : "p-6"} ${className}`}
    >
      {children}
    </motion.div>
  );
}
