import { useState, useCallback } from 'react';

/**
 * Custom hook for monitoring performance of operations
 * @returns {Object} Object containing startTimer, stopTimer, and elapsedTime
 */
export function usePerformanceMonitor() {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);

  const startTimer = useCallback(() => {
    setStartTime(performance.now());
    setElapsedTime(null);
  }, []);

  const stopTimer = useCallback(() => {
    if (startTime !== null) {
      const endTime = performance.now();
      const elapsed = endTime - startTime;
      setElapsedTime(Math.round(elapsed));
      setStartTime(null);
    }
  }, [startTime]);

  const resetTimer = useCallback(() => {
    setStartTime(null);
    setElapsedTime(null);
  }, []);

  return {
    startTimer,
    stopTimer,
    resetTimer,
    elapsedTime,
    isRunning: startTime !== null
  };
}
