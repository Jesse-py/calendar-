import React from 'react';
import { cn } from '../lib/utils';
import { getRating } from '../lib/taskEngine';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
}

export function ProgressRing({
  percentage,
  size = 40,
  strokeWidth = 4,
  className,
  showText = false
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Decide color logic
  let colorClass = 'text-emerald-500';
  if (percentage < 60) colorClass = 'text-red-500';
  else if (percentage < 70) colorClass = 'text-orange-500';
  else if (percentage < 80) colorClass = 'text-yellow-500';
  else if (percentage < 90) colorClass = 'text-blue-500';

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 pointer-events-none" width={size} height={size}>
        <circle
          className="text-slate-200 dark:text-slate-700/50 transition-colors"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-500 ease-out", colorClass)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showText && (
        <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">
          {percentage}%
        </span>
      )}
    </div>
  );
}
