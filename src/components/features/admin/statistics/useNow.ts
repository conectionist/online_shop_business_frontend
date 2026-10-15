import { useEffect, useState } from 'react';

// Re-render on a timer so time-dependent output (countdowns, "today") keeps moving
export const useNow = (intervalMs: number): Date => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};
