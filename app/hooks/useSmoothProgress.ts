// hooks/useSmoothProgress.ts
import { useState, useEffect, useRef } from 'react';

interface UseSmoothProgressOptions {
  duration?: number; // Duration in milliseconds
  onComplete?: () => void;
  autoStart?: boolean;
}

/**
 * Smooth Progress Animation Hook
 * 
 * BEFORE (wasteful setInterval):
 * - setInterval(fn, 100) runs every 100ms regardless of frame rate
 * - Can cause janky animations
 * - Wastes CPU cycles
 * 
 * AFTER (requestAnimationFrame):
 * - Syncs with browser's 60fps refresh rate
 * - Pauses when tab is hidden (saves battery)
 * - Smoother, more performant
 */
export function useSmoothProgress({
  duration = 3000,
  onComplete,
  autoStart = true,
}: UseSmoothProgressOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(newProgress);

      if (newProgress < 100) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
        startTimeRef.current = null;
        onComplete?.();
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isRunning, duration, onComplete]);

  const start = () => {
    setProgress(0);
    startTimeRef.current = null;
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setProgress(0);
    startTimeRef.current = null;
    setIsRunning(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  };

  return {
    progress,
    isRunning,
    start,
    pause,
    reset,
  };
}

// USAGE EXAMPLE:
// function LoadingComponent() {
//   const { progress, start, reset } = useSmoothProgress({
//     duration: 2000,
//     onComplete: () => console.log('Complete!'),
//     autoStart: false,
//   });
//
//   return (
//     <div>
//       <div className="w-full bg-slate-700 rounded-full h-2">
//         <div 
//           className="bg-yellow-400 h-2 rounded-full transition-all duration-100"
//           style={{ width: `${progress}%` }}
//         />
//       </div>
//       <button onClick={start}>Start</button>
//       <button onClick={reset}>Reset</button>
//     </div>
//   );
// }