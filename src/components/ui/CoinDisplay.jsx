import React from 'react';
import { Coins } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CoinDisplay({ balance, size = 'md', showLabel = true, className }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Coins className={cn("text-yellow-400", iconSizes[size])} />
      <span className={cn("font-bold text-yellow-400", sizes[size])}>
        {balance?.toLocaleString() || 0}
      </span>
      {showLabel && (
        <span className="text-gray-400 text-sm">HERU</span>
      )}
    </div>
  );
}