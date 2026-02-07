'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';

interface IntervalProgressProps {
  /**
   * The duration in milliseconds for the progress to complete.
   * @default 5000
   */
  duration?: number;
  /**
   * Callback function to be called when the progress completes.
   */
  onComplete?: () => void;
  /**
   * The size of the progress circle in pixels.
   * @default 24
   */
  size?: number;
  /**
   * The stroke width of the progress circle.
   * @default 3
   */
  strokeWidth?: number;
  /**
   * Class name for custom styling.
   */
  className?: string;
  /**
   * Whether the timer is currently active.
   * @default true
   */
  isActive?: boolean;
  /**
   * Whether the component is in a loading state.
   * During loading, the timer pauses and a spinner is shown.
   * When loading finishes, the timer resets and restarts.
   */
  isLoading?: boolean;
}

export default function IntervalProgress({
  duration = 5000,
  onComplete,
  size = 24,
  strokeWidth = 3,
  className,
  isActive = true,
  isLoading = false,
}: IntervalProgressProps) {
  const [progress, setProgress] = useState(0);
  const updateInterval = 50; // Update every 50ms for smooth animation

  useEffect(() => {
    // If loading, don't run the timer
    // Also, if we just finished loading (isLoading became false), we might want to reset?
    // Actually, let's handle reset in a separate effect or here.
    if (!isActive || isLoading) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (updateInterval / duration) * 100;
        if (next >= 100) {
          onComplete?.();
          return 100; // Snap to 100, wait for isLoading to become true
        }
        return next;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isActive, duration, onComplete, isLoading]);

  // Reset progress when loading finishes
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
    }
  }, [isLoading]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashoffset = circumference - (progress / 100) * circumference;

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Loader2 className="text-primary animate-spin" size={size} />
      </div>
    );
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-primary transition-all duration-100 ease-linear"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: dashoffset,
          }}
        />
      </svg>
    </div>
  );
}
