import { useState, useRef, useEffect } from 'react';

export function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const startYRef = useRef(0);
  const containerRef = useRef(null);
  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;

    const handleTouchStart = (e) => {
      // Only start pull-to-refresh if scrolled to top
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling || startY === 0) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);

      if (distance > 0) {
        e.preventDefault();
        setPullProgress(Math.min(distance / PULL_THRESHOLD, 1));
      }
    };

    const handleTouchEnd = async () => {
      if (pullProgress >= 1) {
        await onRefresh();
      }
      setIsPulling(false);
      setPullProgress(0);
      startY = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullProgress, onRefresh]);

  return { containerRef, isPulling, pullProgress };
}