import { useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_MS = 2 * 60 * 1000;  // warn 2 min before

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];

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

  useEffect(() => {
    resetTimers();
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetTimers, { passive: true }));
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetTimers));
    };
  }, [resetTimers]);

  return null;
}