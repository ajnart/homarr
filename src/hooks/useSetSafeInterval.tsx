import { useEffect, useRef } from 'react';

export function useSetSafeInterval() {
  const timers = useRef<NodeJS.Timeout[]>([]);

  function setSafeInterval(callback: () => void, delay: number) {
    const newInterval = setInterval(callback, delay);
    timers.current.push(newInterval);
    return newInterval;
  }

  useEffect(
    () => () => {
      timers.current.forEach((t) => {
        clearInterval(t);
      });
    },
    []
  );

  return setSafeInterval;
}
