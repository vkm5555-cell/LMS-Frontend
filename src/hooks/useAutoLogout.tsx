import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type Options = {
  timeout?: number; // milliseconds
  onLogout?: () => void;
};

const DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function useAutoLogout(options?: Options) {
  const timeoutRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const navigate = useNavigate();

  const clearTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const logout = () => {
    // clear stored auth
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    if (options?.onLogout) options.onLogout();
    // navigate to home or login
    try { navigate('/'); } catch (e) { /* ignore */ }
  };

  const schedule = () => {
    clearTimer();
    const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
    timeoutRef.current = window.setTimeout(() => {
      logout();
    }, timeout) as unknown as number;
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const activity = () => {
      lastActivityRef.current = Date.now();
      schedule();
    };

    for (const ev of events) window.addEventListener(ev, activity);
    schedule();

    return () => {
      clearTimer();
      for (const ev of events) window.removeEventListener(ev, activity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useAutoLogout;
