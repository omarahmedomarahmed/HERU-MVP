import React from 'react';
import { cn } from "@/lib/utils";

export default function FloatingPanel({ children, className, glowBorder = false }) {
  return (
    <div className={cn(
      "relative bg-zinc-900/80 backdrop-blur-md rounded-xl",
      "border border-zinc-800/60",
      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
      glowBorder && "border-red-500/20 shadow-[0_0_20px_rgba(255,26,26,0.1)]",
      className
    )}>
      {children}
    </div>
  );
}