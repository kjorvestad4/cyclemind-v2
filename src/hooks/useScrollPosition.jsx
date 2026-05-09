import { useEffect, useRef } from 'react';

const scrollPositions = {};

export function useScrollPosition(key) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Restore scroll position when component mounts
    if (scrollPositions[key] !== undefined) {
      container.scrollTop = scrollPositions[key];
    }

    // Save scroll position when scrolling
    const handleScroll = () => {
      scrollPositions[key] = container.scrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [key]);

  return containerRef;
}