import { useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (mobile-friendly)
const WARNING_MS = 2 * 60 * 1000;  // warn 2 min before

// Use visibilitychange + click for mobile; mousemove/keydown for desktop
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'click', 'scroll'];
const VISIBILITY_EVENT = 'visibilitychange';

export default function SessionTimeout() {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const warnedRef = useRef(false);

  const resetTimers = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    warnedRef.current = false;

    warningRef.current = setTimeout(() => {
      if (!warnedRef.current) {
        warnedRef.current = true;
        toast.warning('Your session will expire in 2 minutes due to inactivity.', {
          duration: 10000,
        });
      }
    }, TIMEOUT_MS - WARNING_MS);

    timeoutRef.current = setTimeout(async () => {
      toast.error('Session expired due to inactivity. Please log in again.');
      await new Promise(r => setTimeout(r, 1500));
      base44.auth.logout('/');
    }, TIMEOUT_MS);
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden) {
      // App came back to foreground — reset timers
      resetTimers();
    }
  }, [resetTimers]);

  useEffect(() => {
    resetTimers();
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetTimers, { passive: true }));
    document.addEventListener(VISIBILITY_EVENT, handleVisibilityChange);
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetTimers));
      document.removeEventListener(VISIBILITY_EVENT, handleVisibilityChange);
    };
  }, [resetTimers, handleVisibilityChange]);

  return null;
}