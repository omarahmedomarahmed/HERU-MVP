import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function GameCard({ 
  children, 
  className,
  onClick,
  hoverable = true,
  accentPosition = "top-right"
}) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
      className={cn(
        "relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90",
        "border border-zinc-800/50 rounded-lg overflow-hidden",
        "backdrop-blur-sm",
        hoverable && "cursor-pointer hover:border-red-500/30",
        "transition-all duration-300",
        className
      )}
    >
      {/* Red accent stripe */}
      <div 
        className={cn(
          "absolute w-20 h-1 bg-gradient-to-r from-red-500 to-transparent",
          accentPosition === "top-right" && "top-0 right-0",
          accentPosition === "top-left" && "top-0 left-0",
          accentPosition === "bottom-right" && "bottom-0 right-0 rotate-180",
        )}
      />
      
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}