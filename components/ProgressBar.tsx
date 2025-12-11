import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label = 'Processing...', className }) => {
  return (
    <div className={cn("w-full max-w-md space-y-2 font-mono", className)}>
      <div className="flex justify-between text-xs text-green-500 uppercase tracking-widest font-bold">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-4 w-full bg-zinc-900 border border-zinc-700 relative">
        {/* Grid lines inside progress bar */}
        <div className="absolute inset-0 w-full h-full flex" style={{ pointerEvents: 'none' }}>
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex-1 border-r border-zinc-800 last:border-r-0 h-full"></div>
            ))}
        </div>
        <motion.div
          className="h-full bg-green-500 border-r-2 border-white relative z-10"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "tween", ease: "linear", duration: 0.2 }}
        />
      </div>
    </div>
  );
};