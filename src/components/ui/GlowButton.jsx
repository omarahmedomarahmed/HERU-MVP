import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function GlowButton({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md",
  disabled = false,
  className,
  ...props 
}) {
  const variants = {
    primary: "bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-[0_0_30px_rgba(255,26,26,0.5)]",
    secondary: "bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500/10",
    ghost: "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-base"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative font-bold uppercase tracking-wider transition-all duration-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      style={{
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}